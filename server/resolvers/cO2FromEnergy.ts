import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
import cO2Multiplier from "../utils/cO2Multiplier";
import { Co2FromEnergyResolvers, Co2Unit, Co2FromEnergyDimensions, Co2FromEnergy } from "../types";
import cO2Units from "../utils/cO2Units";
import {
  HISTORICAL_CO2_EMISSIONS_FROM_ENERGY_eia_with_zones_prod as BY_ENERGY_FAMILY,
  HISTORICAL_CO2_EMISSIONS_PER_CAPITA_co2_per_capita_prod as PER_CAPITA,
  CARBON_INTENSITY_OF_GDP_carbon_intensity_of_gdp_prod as PER_GDP,
  HISTORICAL_CO2_EMISSIONS_FROM_ENERGY_eia_with_zones_prod as TOTAL,
  country_multiselect_groups as MULTI_SELECT,
} from "../dbSchema";
import typeColor from "../utils/typeColor";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";

const cO2FromEnergy: Co2FromEnergyResolvers = {
  async mdInfos(_, {}, { dataSources: { db } }): Promise<Co2FromEnergy["mdInfos"]> {
    return await getMdInfos(db.knex, "co2-from-energy");
  },
  emissionsUnits() {
    return cO2Units;
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<Co2FromEnergy["multiSelects"]> {
    const res: Co2FromEnergy["multiSelects"] = [];

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
          .map((countryObject) => countryObject.country)
          .map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
      });
    }
    return res;
  },
  async energyFamilies(_, __, { dataSources: { db } }): Promise<Co2FromEnergy["energyFamilies"]> {
    const res = await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .select(BY_ENERGY_FAMILY.energy_family)
      .sum({ sumEmissions: BY_ENERGY_FAMILY.co2 })
      .groupBy(BY_ENERGY_FAMILY.energy_family)
      .orderBy("sumEmissions", "DESC")
      .whereNotNull(BY_ENERGY_FAMILY.energy_family)
      .pluck(BY_ENERGY_FAMILY.energy_family)
      .cache(15 * 60);
    return res.map((energyFamily) => ({ name: energyFamily, color: typeColor(energyFamily) }));
  },
  async countries(_, __, { dataSources: { db } }): Promise<Co2FromEnergy["countries"]> {
    return await distinctCountries(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<Co2FromEnergy["groups"]> {
    return await distinctGroups(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Co2FromEnergy["zones"]> {
    return await distinctZones(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async gdpUnits(_, __, { dataSources: { db } }): Promise<Co2FromEnergy["gdpUnits"]> {
    return await db
      .knex(PER_GDP.__tableName)
      .distinct(PER_GDP.gdp_unit)
      .orderBy(PER_GDP.gdp_unit, "asc")
      .pluck(PER_GDP.gdp_unit)
      .cache(15 * 60);
  },
  dimensions(): Co2FromEnergy["dimensions"] {
    return Object.values(Co2FromEnergyDimensions);
  },
  async byEnergyFamily(
    _,
    { energyFamilies, emissionsUnit, groupName, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Co2FromEnergy["byEnergyFamily"]> {
    const resRawQuery = db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .select(
        BY_ENERGY_FAMILY.year,
        BY_ENERGY_FAMILY.energy_family,
        BY_ENERGY_FAMILY.group_type,
        BY_ENERGY_FAMILY.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          BY_ENERGY_FAMILY.co2,
          emissionsUnit ? cO2Multiplier(Co2Unit.MtCo2, emissionsUnit) : 1,
          BY_ENERGY_FAMILY.co2,
        ])
      )
      .whereIn(BY_ENERGY_FAMILY.energy_family, energyFamilies)
      .whereNotNull(BY_ENERGY_FAMILY.group_name)
      .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
      .andWhere(BY_ENERGY_FAMILY.group_name, groupName)
      .groupBy(
        BY_ENERGY_FAMILY.year,
        BY_ENERGY_FAMILY.energy_family,
        BY_ENERGY_FAMILY.group_type,
        BY_ENERGY_FAMILY.group_name
      )
      .orderBy(BY_ENERGY_FAMILY.energy_family, BY_ENERGY_FAMILY.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .distinct(BY_ENERGY_FAMILY.year)
      .whereIn(BY_ENERGY_FAMILY.energy_family, energyFamilies)
      .whereNotNull(BY_ENERGY_FAMILY.group_name)
      .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
      .andWhere(BY_ENERGY_FAMILY.group_name, groupName)
      .orderBy(BY_ENERGY_FAMILY.year)
      .pluck(BY_ENERGY_FAMILY.year)
      .cache(15 * 60);
    const [resRaw, years] = await Promise.all([resRawQuery, yearsQuery]);
    return {
      categories: years,
      series: energyFamilies.map((energyFamily) => {
        const energyFamilyRaw = resRaw.filter((row) => {
          return row[BY_ENERGY_FAMILY.energy_family] === energyFamily;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)
            ? energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)[BY_ENERGY_FAMILY.co2]
            : null
        );
        return {
          name: energyFamily,
          data: data as number[],
          color: typeColor(energyFamily),
        };
      }),
    };
  },
  async perCapita(
    _,
    { emissionsUnit, groupNames, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Co2FromEnergy["perCapita"]> {
    // Get all the rows necessary
    const resRawQuery = await db
      .knex(PER_CAPITA.__tableName)
      .select(
        PER_CAPITA.year,
        PER_CAPITA.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          PER_CAPITA.co2_per_capita,
          emissionsUnit ? cO2Multiplier(Co2Unit.MtCo2, emissionsUnit) : 1,
          PER_CAPITA.co2_per_capita,
        ])
      )
      .whereIn(PER_CAPITA.group_name, groupNames)
      .whereNotNull(PER_CAPITA.group_name)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = await db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .orderBy(PER_CAPITA.year)
      .pluck(PER_CAPITA.year)
      .cache(15 * 60);

    // Get the multi-selects for this specific dimension
    const multiSelects = [];
    const subQuery = db.knex(BY_ENERGY_FAMILY.__tableName).max(BY_ENERGY_FAMILY.year);
    // Top 10 countries based on the last year
    const perCapitaTopCountriesDataQuery = await db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.co2_per_capita })
      .whereNotNull(PER_CAPITA.group_name)
      .andWhere(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .groupBy(PER_CAPITA.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(PER_CAPITA.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const perCapitaFlopCountriesDataQuery = await db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.co2_per_capita })
      .whereNotNull(PER_CAPITA.group_name)
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
      perCapitaFlopCountriesDataQuery,
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: perCapitaTopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: perCapitaFlopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });

    return {
      multiSelects,
      categories: years,
      series: groupNames.map((groupName) => {
        const groupNameRaw = resRaw.filter((row) => {
          return row[PER_CAPITA.group_name] === groupName;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          groupNameRaw.find((row) => row[PER_CAPITA.year] === year)
            ? groupNameRaw.find((row) => row[PER_CAPITA.year] === year)[PER_CAPITA.co2_per_capita]
            : null
        );
        return {
          name: groupName,
          data: data as number[],
          color: stringToColor(groupName),
        };
      }),
    };
  },
  async perGDP(
    _,
    { emissionsUnit, groupNames, gdpUnit, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Co2FromEnergy["perGDP"]> {
    // Get all the rows necessary
    const resRawQuery = db
      .knex(PER_GDP.__tableName)
      .select(
        PER_GDP.year,
        PER_GDP.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          PER_GDP.co2_per_gdp,
          emissionsUnit ? cO2Multiplier(Co2Unit.MtCo2, emissionsUnit) : 1,
          PER_GDP.co2_per_gdp,
        ])
      )
      .whereIn(PER_GDP.group_name, groupNames)
      .andWhereBetween(PER_GDP.year, [yearStart, yearEnd])
      .andWhere(PER_GDP.gdp_unit, gdpUnit)
      .groupBy(PER_GDP.year, PER_GDP.group_name)
      .orderBy(PER_GDP.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_GDP.__tableName)
      .distinct(PER_GDP.year)
      .whereIn(PER_GDP.group_name, groupNames)
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
      perCapitaFlopCountriesDataQuery,
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: perCapitaTopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: perCapitaFlopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });

    return {
      multiSelects,
      categories: years,
      series: groupNames.map((groupName) => {
        const groupNameRaw = resRaw.filter((row) => {
          return row[PER_GDP.group_name] === groupName;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          groupNameRaw.find((row) => row[PER_GDP.year] === year)
            ? groupNameRaw.find((row) => row[PER_GDP.year] === year)[PER_GDP.co2_per_gdp]
            : null
        );
        return {
          name: groupName,
          data: data as number[],
          color: stringToColor(groupName),
        };
      }),
    };
  },
  async total(
    _,
    { emissionsUnit, groupNames, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Co2FromEnergy["total"]> {
    const resRawQuery = db
      .knex(TOTAL.__tableName)
      .select(
        TOTAL.year,
        TOTAL.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          TOTAL.co2,
          emissionsUnit ? cO2Multiplier(Co2Unit.MtCo2, emissionsUnit) : 1,
          TOTAL.co2,
        ])
      )
      .whereIn(TOTAL.group_name, groupNames)
      .whereNotNull(TOTAL.group_name)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .groupBy(TOTAL.year, TOTAL.group_name)
      .orderBy(TOTAL.year)
      .cache(15 * 60);
    const yearsQuery = db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.year)
      .whereIn(TOTAL.group_name, groupNames)
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
      TotalFlopCountriesDataQuery,
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: TotalTopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: TotalFlopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    return {
      multiSelects,
      categories: years,
      series: groupNames.map((groupName) => {
        const groupNameRaw = resRaw.filter((row) => {
          return row[TOTAL.group_name] === groupName;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          groupNameRaw.find((row) => row[TOTAL.year] === year)
            ? groupNameRaw.find((row) => row[TOTAL.year] === year)[TOTAL.co2]
            : null
        );
        return {
          name: groupName,
          data: data as number[],
          color: stringToColor(groupName),
        };
      }),
    };
  },
};
export default cO2FromEnergy;
