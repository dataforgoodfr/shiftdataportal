import { Co2eqUnit, Co2Unit } from "../types";
import { distinctCountries, distinctGroups, distinctZones } from "./helpers";

import cO2EqUnits from "../utils/cO2EqUnits";
import cO2EqMultiplier from "../utils/cO2EqMultiplier";
import { GhgByGasResolvers, GhgByGas, GhgByGasDimensions } from "../types";
import {
  GHG_EMISSIONS_ghg_full_by_gas_prod as BY_GAS,
  GHG_EMISSIONS_PER_CAPITA_ghg_per_capita_prod as PER_CAPITA,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT,
  CARBON_INTENSITY_OF_GDP_carbon_intensity_of_gdp_prod as PER_GDP,
  GHG_EMISSIONS_ghg_full_by_sector_prod as BY_SECTOR,
} from "../dbSchema";
import typeColor from "../utils/typeColor";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";
import cO2Multiplier from "../utils/cO2Multiplier";
const ghgByGas: GhgByGasResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<GhgByGas["mdInfos"]> {
    return await getMdInfos(db.knex, "ghg");
  },
  emissionsUnits() {
    return cO2EqUnits;
  },
  async gdpUnits(_, __, { dataSources: { db } }): Promise<GhgByGas["gdpUnits"]> {
    return await db
      .knex(PER_GDP.__tableName)
      .distinct(PER_GDP.gdp_unit)
      .orderBy(PER_GDP.gdp_unit, "asc")
      .pluck(PER_GDP.gdp_unit)
      .cache(15 * 60);
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<GhgByGas["multiSelects"]> {
    const res: GhgByGas["multiSelects"] = [];
    const resRaw = await db
      .knex(MULTI_SELECT.__tableName)
      .select(MULTI_SELECT.country, MULTI_SELECT.group)
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
  async sources(_, { dimension }, { dataSources: { db } }): Promise<GhgByGas["sources"]> {
    const TABLE = dimensionToTableName(dimension);
    return await db
      .knex(TABLE.__tableName)
      .distinct(TABLE.source)
      .orderBy(TABLE.source, "asc")
      .whereNotNull(TABLE.source)
      .pluck("source")
      .cache(15 * 60);
  },
  async gases(_, { source }, { dataSources: { db } }): Promise<GhgByGas["gases"]> {
    // Require "source" argument because group types might differ when source changes.
    // Doing a sum to have the order of which gas
    const res = await db
      .knex(BY_GAS.__tableName)
      .select(BY_GAS.gas)
      .sum({ sumGhg: BY_GAS.ghg })
      .whereNotNull(BY_GAS.gas)
      .andWhere(function () {
        this.where(BY_GAS.including_lucf, false).orWhere(BY_GAS.including_lucf, null);
      })
      .andWhere({ source })
      .groupBy(BY_GAS.gas)
      .orderBy("sumGhg", "DESC")
      .pluck(BY_GAS.gas)
      .cache(15 * 60);

    return res.map((gas) => ({ name: gas, color: typeColor(gas) }));
  },
  async sectors(_, { source }, { dataSources: { db } }): Promise<GhgByGas["sectors"]> {
    // Require "source" argument because group types might differ when source changes.
    // Doing a sum to have the order of which gas
    const res = await db
      .knex(BY_SECTOR.__tableName)
      .select(BY_SECTOR.sector)
      .sum({ sumGhg: BY_SECTOR.ghg })
      .where({ source })
      .andWhereNot(BY_SECTOR.sector, "LUCF")
      .groupBy(BY_SECTOR.sector)
      .orderBy("sumGhg", "DESC")
      .pluck(BY_SECTOR.sector)
      .cache(15 * 60);
    return res.map((sector) => ({ name: sector, color: typeColor(sector) }));
  },
  async countries(_, __, { dataSources: { db } }): Promise<GhgByGas["countries"]> {
    return await distinctCountries(BY_GAS.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<GhgByGas["groups"]> {
    return await distinctGroups(BY_GAS.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<GhgByGas["zones"]> {
    return await distinctZones(BY_GAS.__tableName, db.knex);
  },
  dimensions(): GhgByGas["dimensions"] {
    return Object.values(GhgByGasDimensions);
  },
  async perGDP(
    _,
    { emissionsUnit, groupNames, gdpUnit, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<GhgByGas["perGDP"]> {
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
  async byGas(
    _,
    { source, gases, emissionsUnit, groupName, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<GhgByGas["byGas"]> {
    const resRawQuery = db
      .knex(BY_GAS.__tableName)
      .select(
        BY_GAS.year,
        BY_GAS.gas,
        BY_GAS.group_type,
        BY_GAS.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          BY_GAS.ghg,
          emissionsUnit ? cO2EqMultiplier(Co2eqUnit.MtCo2eq, emissionsUnit) : 1,
          BY_GAS.ghg,
        ])
      )
      .andWhere(function () {
        this.where(BY_GAS.including_lucf, false).orWhere(BY_GAS.including_lucf, null);
      })
      .whereIn(BY_GAS.gas, gases)
      .andWhereBetween(BY_GAS.year, [yearStart, yearEnd])
      .andWhere(BY_GAS.source, source)
      .andWhere(BY_GAS.group_name, groupName)
      .groupBy(BY_GAS.year, BY_GAS.gas, BY_GAS.source, BY_GAS.group_type, BY_GAS.group_name)
      .orderBy(BY_GAS.gas, BY_GAS.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(BY_GAS.__tableName)
      .distinct(BY_GAS.year)
      .whereIn(BY_GAS.gas, gases)
      .andWhereBetween(BY_GAS.year, [yearStart, yearEnd])
      .andWhere(BY_GAS.source, source)
      .andWhere(BY_GAS.group_name, groupName)
      .andWhere(function () {
        this.where(BY_GAS.including_lucf, false).orWhere(BY_GAS.including_lucf, null);
      })
      .orderBy(BY_GAS.year)
      .pluck(BY_GAS.year)
      .cache(15 * 60);
    const [resRaw, years] = await Promise.all([resRawQuery, yearsQuery]);
    return {
      categories: years,
      series: gases.map((gases) => {
        const gasesRaw = resRaw.filter((row) => {
          return row[BY_GAS.gas] === gases;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          gasesRaw.find((row) => row[BY_GAS.year] === year)
            ? gasesRaw.find((row) => row[BY_GAS.year] === year)[BY_GAS.ghg]
            : null
        );
        return {
          name: gases,
          data: data as number[],
          color: typeColor(gases),
        };
      }),
    };
  },
  async perCapita(
    _,
    { emissionsUnit, groupNames, yearStart, yearEnd, source },
    { dataSources: { db } }
  ): Promise<GhgByGas["perCapita"]> {
    // Get all the rows necessary
    const resRawQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(
        PER_CAPITA.year,
        PER_CAPITA.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          PER_CAPITA.ghg_per_capita,
          emissionsUnit ? cO2EqMultiplier(Co2eqUnit.MtCo2eq, emissionsUnit) : 1,
          PER_CAPITA.ghg_per_capita,
        ])
      )
      .andWhere(PER_CAPITA.source, source)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .andWhere(PER_CAPITA.source, source)
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
      .sum({ sum: PER_CAPITA.ghg_per_capita })
      .where(PER_CAPITA.group_type, "country")
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
      .sum({ sum: PER_CAPITA.ghg_per_capita })
      .where(PER_CAPITA.group_type, "country")
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
            ? groupNameRaw.find((row) => row[PER_CAPITA.year] === year)[PER_CAPITA.ghg_per_capita]
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
  async bySector(
    _,
    { source, sectors, emissionsUnit, groupName, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<GhgByGas["bySector"]> {
    const resRawQuery = db
      .knex(BY_SECTOR.__tableName)
      .select(
        BY_SECTOR.year,
        BY_SECTOR.sector,
        BY_SECTOR.group_type,
        BY_SECTOR.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          BY_SECTOR.ghg,
          emissionsUnit ? cO2EqMultiplier(Co2eqUnit.MtCo2eq, emissionsUnit) : 1,
          BY_SECTOR.ghg,
        ])
      )
      .whereIn(BY_SECTOR.sector, sectors)
      .andWhereBetween(BY_SECTOR.year, [yearStart, yearEnd])
      .andWhere(BY_SECTOR.group_name, groupName)
      .andWhere(BY_SECTOR.source, source)
      // Make it work with negative values on the front-end
      .andWhereNot(BY_SECTOR.sector, "LUCF")
      .groupBy(BY_SECTOR.year, BY_SECTOR.sector, BY_SECTOR.group_type, BY_SECTOR.group_name)
      .orderBy(BY_SECTOR.sector, BY_SECTOR.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(BY_SECTOR.__tableName)
      .distinct(BY_SECTOR.year)
      .whereIn(BY_SECTOR.sector, sectors)
      .andWhereBetween(BY_SECTOR.year, [yearStart, yearEnd])
      .andWhere(BY_SECTOR.group_name, groupName)
      .andWhere(BY_SECTOR.source, source)
      .orderBy(BY_SECTOR.year)
      .pluck(BY_SECTOR.year)
      .cache(15 * 60);
    const [resRaw, years] = await Promise.all([resRawQuery, yearsQuery]);
    return {
      categories: years,
      series: sectors.map((sector) => {
        const sectorRaw = resRaw.filter((row) => {
          return row[BY_SECTOR.sector] === sector;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          sectorRaw.find((row) => row[BY_SECTOR.year] === year)
            ? sectorRaw.find((row) => row[BY_SECTOR.year] === year)[BY_SECTOR.ghg]
            : null
        );
        return {
          name: sector,
          data: data as number[],
          color: typeColor(sector),
        };
      }),
    };
  },

  async total(
    _,
    { source, emissionsUnit, groupNames, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<GhgByGas["total"]> {
    const resRawQuery = db
      .knex(BY_SECTOR.__tableName)
      .select(
        BY_SECTOR.year,
        BY_SECTOR.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          BY_SECTOR.ghg,
          emissionsUnit ? cO2EqMultiplier(Co2eqUnit.MtCo2eq, emissionsUnit) : 1,
          BY_SECTOR.ghg,
        ])
      )
      .whereIn(BY_SECTOR.group_name, groupNames)
      .andWhere(BY_SECTOR.source, source)
      .andWhereBetween(BY_SECTOR.year, [yearStart, yearEnd])
      .groupBy(BY_SECTOR.year, BY_SECTOR.group_name)
      .orderBy(BY_SECTOR.year)
      .cache(15 * 60);
    const yearsQuery = db
      .knex(BY_SECTOR.__tableName)
      .distinct(BY_SECTOR.year)
      .whereIn(BY_SECTOR.group_name, groupNames)
      .andWhere(BY_SECTOR.source, source)
      .andWhereBetween(BY_SECTOR.year, [yearStart, yearEnd])
      .orderBy(BY_SECTOR.year)
      .pluck(BY_SECTOR.year)
      .cache(15 * 60);

    // Get the multi-selects option
    const multiSelects = [];
    const maxYearSubQuery = db.knex(BY_SECTOR.__tableName).max(BY_SECTOR.year);
    const TotalTopCountriesDataQuery = db
      .knex(BY_SECTOR.__tableName)
      .select(BY_SECTOR.group_name)
      .sum({ sum: BY_SECTOR.ghg })
      .where(BY_SECTOR.group_type, "country")
      .andWhere(BY_SECTOR.source, source)
      .andWhere(BY_SECTOR.year, maxYearSubQuery)
      .groupBy(BY_SECTOR.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(BY_SECTOR.group_name)
      .cache(15 * 60);

    const TotalFlopCountriesDataQuery = db
      .knex(BY_SECTOR.__tableName)
      .select(BY_SECTOR.group_name)
      .sum({ sum: BY_SECTOR.ghg })
      .where(BY_SECTOR.group_type, "country")
      .andWhere(BY_SECTOR.source, source)
      .andWhere(BY_SECTOR.year, maxYearSubQuery)
      .groupBy(BY_SECTOR.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(BY_SECTOR.group_name)
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
          return row[BY_SECTOR.group_name] === groupName;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          groupNameRaw.find((row) => row[BY_SECTOR.year] === year)
            ? groupNameRaw.find((row) => row[BY_SECTOR.year] === year)[BY_SECTOR.ghg]
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
const dimensionToTableName = (dimension: string): any => {
  switch (dimension) {
    case "byGas":
      return BY_GAS;
    case "bySector":
      return BY_SECTOR;
    case "perCapita":
      return PER_CAPITA;
    case "total":
      return BY_GAS;
    default:
      throw new Error(
        `Argument 'sources' requires a valid dimension, '${dimension}' is not a valid dimension or isn't handled.`
      );
  }
};
export default ghgByGas;
