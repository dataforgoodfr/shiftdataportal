import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
import cO2Multiplier from "../utils/cO2Multiplier";
import { FootprintResolvers, Co2Unit, FootprintDimensions, Footprint } from "../types";
import cO2Units from "../utils/cO2Units";
import {
  CO2_CBA_PER_CAPITA_eora_cba_zones_per_capita_prod as PER_CAPITA,
  CO2_CBA_PER_GDP_eora_cba_per_gdp_prod as PER_GDP,
  CO2_CONSUMPTION_BASED_ACCOUNTING_footprint_vs_territorial_prod as TOTAL,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT
} from "../dbSchema";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";

const footprint: FootprintResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<Footprint["mdInfos"]> {
    return await getMdInfos(db.knex, "carbon-footprint");
  },
  emissionsUnits() {
    return cO2Units;
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<Footprint["multiSelects"]> {
    const res: Footprint["multiSelects"] = [];

    const resRaw = await db
      .knex(MULTI_SELECT.__tableName)
      .select(MULTI_SELECT.country, MULTI_SELECT.group)
      .whereNotNull(MULTI_SELECT.country)
      .orderBy([MULTI_SELECT.group, MULTI_SELECT.country])
      .cache(15 * 60);
    const groups = groupBy(resRaw, MULTI_SELECT.group);

    for (let key in groups) {
      res.push({
        name: key,
        data: groups[key]
          .map(countryObject => countryObject.country)
          .map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
      });
    }
    return res;
  },
  async countries(_, __, { dataSources: { db } }): Promise<Footprint["countries"]> {
    return await distinctCountries(PER_CAPITA.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<Footprint["groups"]> {
    return await distinctGroups(PER_CAPITA.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Footprint["zones"]> {
    return await distinctZones(PER_CAPITA.__tableName, db.knex);
  },
  async scopes(_, __, { dataSources: { db } }): Promise<Footprint["scopes"]> {
    return await db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.scope)
      .orderBy(PER_CAPITA.scope, "asc")
      .pluck(PER_CAPITA.scope)
      .cache(15 * 60);
  },
  async gdpUnits(_, __, { dataSources: { db } }): Promise<Footprint["gdpUnits"]> {
    return await db
      .knex(PER_GDP.__tableName)
      .distinct(PER_GDP.gdp_unit)
      .orderBy(PER_GDP.gdp_unit, "asc")
      .pluck(PER_GDP.gdp_unit)
      .cache(15 * 60);
  },
  dimensions(): Footprint["dimensions"] {
    return Object.values(FootprintDimensions);
  },
  async perCapita(
    _,
    { emissionsUnit, groupNames, yearStart, yearEnd, scopes },
    { dataSources: { db } }
  ): Promise<Footprint["perCapita"]> {
    // Get all the rows necessary
    const resRawQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(
        PER_CAPITA.year,
        PER_CAPITA.group_name,
        PER_CAPITA.scope,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          PER_CAPITA.co2_per_capita,
          emissionsUnit ? cO2Multiplier(Co2Unit.MtCo2, emissionsUnit) : 1,
          PER_CAPITA.co2_per_capita
        ])
      )
      .whereIn(PER_CAPITA.group_name, groupNames)
      .whereIn(PER_CAPITA.scope, scopes)
      .whereNotNull(PER_CAPITA.group_name)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name, PER_CAPITA.scope)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .orderBy(PER_CAPITA.year)
      .pluck(PER_CAPITA.year)
      .cache(15 * 60);

    // Get the multi-selects for this specific dimension
    const multiSelects = [];
    const subQuery = db.knex(PER_CAPITA.__tableName).max(PER_CAPITA.year);
    // Top 10 countries based on the last year
    const perCapitaTopCountriesDataQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.co2_per_capita })
      .whereNotNull(PER_CAPITA.group_name)
      .whereIn(PER_CAPITA.scope, scopes)
      .andWhere(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .groupBy(PER_CAPITA.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(PER_CAPITA.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const perCapitaFlopCountriesDataQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.co2_per_capita })
      .whereNotNull(PER_CAPITA.group_name)
      .whereIn(PER_CAPITA.scope, scopes)
      .andWhere(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .groupBy(PER_CAPITA.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(PER_CAPITA.group_name)
      .cache(15 * 60);

    const [resRaw, years, perCapitaTopCountriesData, perCapitaFlopCountriesData] = await Promise.all([
      resRawQuery,
      yearsQuery,
      perCapitaTopCountriesDataQuery,
      perCapitaFlopCountriesDataQuery
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: perCapitaTopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: perCapitaFlopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    const series = [];
    scopes.map(scope => {
      groupNames.map(groupName => {
        const groupNameRaw = resRaw.filter(row => {
          return row[PER_CAPITA.group_name] === groupName && row[PER_CAPITA.scope] === scope;
        });
        const data = years.map(year =>
          // Fill missing year with null in the
          groupNameRaw.find(row => row[PER_CAPITA.year] === year)
            ? groupNameRaw.find(row => row[PER_CAPITA.year] === year)[PER_CAPITA.co2_per_capita]
            : null
        );
        series.push({
          name: groupName + " - " + scope,
          data: data as number[],
          color: stringToColor(groupName),
          dashStyle: scope === "Carbon Footprint" ? "Solid" : "LongDash"
        });
      });
    });
    return {
      multiSelects,
      categories: years,
      series
    };
  },
  async perGDP(
    _,
    { emissionsUnit, groupNames, gdpUnit, yearStart, yearEnd, scopes },
    { dataSources: { db } }
  ): Promise<Footprint["perGDP"]> {
    // Get all the rows necessary
    const resRawQuery = db
      .knex(PER_GDP.__tableName)
      .select(
        PER_GDP.year,
        PER_GDP.group_name,
        PER_GDP.scope,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          PER_GDP.co2_per_gdp,
          emissionsUnit ? cO2Multiplier(Co2Unit.MtCo2, emissionsUnit) : 1,
          PER_GDP.co2_per_gdp
        ])
      )
      .whereIn(PER_GDP.group_name, groupNames)
      .whereIn(PER_GDP.scope, scopes)
      .andWhereBetween(PER_GDP.year, [yearStart, yearEnd])
      .andWhere(PER_GDP.gdp_unit, gdpUnit)
      .groupBy(PER_GDP.year, PER_GDP.group_name, PER_GDP.scope)
      .orderBy(PER_GDP.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_GDP.__tableName)
      .distinct(PER_GDP.year)
      .whereIn(PER_GDP.group_name, groupNames)
      .whereIn(PER_GDP.scope, scopes)
      .andWhere(PER_GDP.gdp_unit, gdpUnit)
      .andWhereBetween(PER_GDP.year, [yearStart, yearEnd])
      .orderBy(PER_GDP.year)
      .pluck(PER_GDP.year)
      .cache(15 * 60);

    // Get the multi-selects for this specific dimension
    const multiSelects = [];
    const subQuery = db.knex(PER_GDP.__tableName).max(PER_GDP.year);
    // Top 10 countries based on the last year
    const perCapitaTopCountriesDataQuery = db
      .knex(PER_GDP.__tableName)
      .select(PER_GDP.group_name)
      .sum({ sum: PER_GDP.co2_per_gdp })
      .whereIn(PER_GDP.scope, scopes)
      .whereNotNull(PER_GDP.group_name)
      .andWhere(PER_GDP.group_type, "country")
      .andWhere(PER_GDP.year, subQuery)
      .andWhere(PER_GDP.gdp_unit, gdpUnit)
      .groupBy(PER_GDP.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(PER_GDP.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const perCapitaFlopCountriesDataQuery = db
      .knex(PER_GDP.__tableName)
      .select(PER_GDP.group_name)
      .sum({ sum: PER_GDP.co2_per_gdp })
      .whereIn(PER_GDP.scope, scopes)
      .whereNotNull(PER_GDP.group_name)
      .andWhere(PER_GDP.group_type, "country")
      .andWhere(PER_GDP.year, subQuery)
      .andWhere(PER_GDP.gdp_unit, gdpUnit)
      .groupBy(PER_GDP.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(PER_GDP.group_name)
      .cache(15 * 60);
    const [resRaw, years, perCapitaTopCountriesData, perCapitaFlopCountriesData] = await Promise.all([
      resRawQuery,
      yearsQuery,
      perCapitaTopCountriesDataQuery,
      perCapitaFlopCountriesDataQuery
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: perCapitaTopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: perCapitaFlopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    const series = [];
    scopes.map(scope => {
      groupNames.map(groupName => {
        const groupNameRaw = resRaw.filter(row => {
          return row[PER_GDP.group_name] === groupName && row[PER_GDP.scope] === scope;
        });
        const data = years.map(year =>
          // Fill missing year with null in the
          groupNameRaw.find(row => row[PER_GDP.year] === year)
            ? groupNameRaw.find(row => row[PER_GDP.year] === year)[PER_GDP.co2_per_gdp]
            : null
        );
        series.push({
          name: groupName + " - " + scope,
          data: data as number[],
          color: stringToColor(groupName),
          dashStyle: scope === "Carbon Footprint" ? "Solid" : "LongDash"
        });
      });
    });
    return {
      multiSelects,
      categories: years,
      series
    };
  },
  async total(
    _,
    { emissionsUnit, groupNames, yearStart, yearEnd, scopes },
    { dataSources: { db } }
  ): Promise<Footprint["total"]> {
    const resRawQuery = db
      .knex(TOTAL.__tableName)
      .select(
        TOTAL.year,
        TOTAL.group_name,
        TOTAL.scope,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          TOTAL.co2,
          emissionsUnit ? cO2Multiplier(Co2Unit.MtCo2, emissionsUnit) : 1,
          TOTAL.co2
        ])
      )
      .whereIn(TOTAL.group_name, groupNames)
      .whereIn(TOTAL.scope, scopes)
      .whereNotNull(TOTAL.group_name)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .groupBy(TOTAL.year, TOTAL.group_name, TOTAL.scope)
      .orderBy(TOTAL.year)
      .cache(15 * 60);
    const yearsQuery = db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.year)
      .whereIn(TOTAL.group_name, groupNames)
      .whereIn(TOTAL.scope, scopes)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .orderBy(TOTAL.year)
      .pluck(TOTAL.year)
      .cache(15 * 60);
    // Get the multi-selects option
    const multiSelects = [];
    const maxYearSubQuery = db.knex(TOTAL.__tableName).max(TOTAL.year);
    const TotalTopCountriesDataQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name)
      .sum({ sum: TOTAL.co2 })
      .whereNotNull(TOTAL.group_name)
      .whereIn(TOTAL.scope, scopes)
      .where(TOTAL.group_type, "country")
      .andWhere(TOTAL.year, maxYearSubQuery)
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);

    const TotalFlopCountriesDataQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name)
      .sum({ sum: TOTAL.co2 })
      .where(TOTAL.group_type, "country")
      .whereIn(TOTAL.scope, scopes)
      .whereNotNull(TOTAL.group_name)
      .andWhere(TOTAL.year, maxYearSubQuery)
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);

    const [resRaw, years, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      resRawQuery,
      yearsQuery,
      TotalTopCountriesDataQuery,
      TotalFlopCountriesDataQuery
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: TotalTopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: TotalFlopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });

    const series = [];
    scopes.map(scope => {
      groupNames.map(groupName => {
        const groupNameRaw = resRaw.filter(row => {
          return row[TOTAL.group_name] === groupName && row[TOTAL.scope] === scope;
        });
        const data = years.map(year =>
          // Fill missing year with null in the
          groupNameRaw.find(row => row[TOTAL.year] === year)
            ? groupNameRaw.find(row => row[TOTAL.year] === year)[TOTAL.co2]
            : null
        );
        series.push({
          name: groupName + " - " + scope,
          data: data as number[],
          color: stringToColor(groupName),
          dashStyle: scope === "Carbon Footprint" ? "Solid" : "LongDash"
        });
      });
    });
    return {
      multiSelects,
      categories: years,
      series
    };
  }
};
export default footprint;
