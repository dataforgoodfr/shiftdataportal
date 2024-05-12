import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
// import db from "../db";
import energyMultiplier from "../utils/energyMultiplier";
import { OilResolvers, EnergyUnit, OilDimensions, Oil } from "../types";
import energyUnits from "../utils/energyUnits";
import {
  IEA_API_final_cons_oil_products_by_sector_prod as BY_SECTOR,
  ENERGY_PER_CAPITA_energy_per_capita_prod as PER_CAPITA,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT,
  FOSSIL_RESERVES_bp_fossil_with_zones_prod as PROVEN_RESERVE,
  OIL_EXTRAPOLATION_oil_prod_extrapolation_prod as OLD_EXTRAPOLATION,
  OIL_EXTRAPOLATION_oil_prod_weo_extrapolated_prod as EXTRAPOLATION,
  WORLD_ENERGY_HISTORY_primary_energy_prod as TOTAL,
} from "../dbSchema";
import groupBy from "../utils/groupBy";
import stringToColor from "../utils/stringToColor";
import typeColor from "../utils/typeColor";
import getMdInfos from "./helpers/getMdInfos";
const oil: OilResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<Oil["mdInfos"]> {
    return await getMdInfos(db.knex, "oil");
  },
  energyUnits(): Oil["energyUnits"] {
    return energyUnits;
  },
  async multiSelects(_, { countriesOnly = false }, { dataSources: { db } }): Promise<Oil["multiSelects"]> {
    const res: Oil["multiSelects"] = [];
    const resRaw = await db
      .knex(MULTI_SELECT.__tableName)
      .select(MULTI_SELECT.country, MULTI_SELECT.group)
      .andWhere(MULTI_SELECT.country_only, countriesOnly)
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
  async countries(_, __, { dataSources: { db } }): Promise<Oil["countries"]> {
    return await distinctCountries(BY_SECTOR.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<Oil["groups"]> {
    return await distinctGroups(BY_SECTOR.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Oil["zones"]> {
    return await distinctZones(BY_SECTOR.__tableName, db.knex);
  },
  async sectors(_, __, { dataSources: { db } }): Promise<Oil["sectors"]> {
    const res = await db
      .knex(BY_SECTOR.__tableName)
      .distinct(BY_SECTOR.sector)
      .whereNotNull(BY_SECTOR.sector)
      .orderBy(BY_SECTOR.sector, "asc")
      .pluck(BY_SECTOR.sector)
      .cache(15 * 60);
    return res.map((sector) => ({ name: sector, color: typeColor(sector) }));
  },
  dimensions(): Oil["dimensions"] {
    return Object.values(OilDimensions);
  },

  async perCapita(_, { groupNames, energyUnit, yearStart, yearEnd, type }, { dataSources: { db } }) {
    // Get all the rows necessary
    const resRawQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(
        PER_CAPITA.year,
        PER_CAPITA.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          PER_CAPITA.energy_per_capita,
          energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
          PER_CAPITA.energy_per_capita,
        ])
      )
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Total Primary Oil Consumption")
      .andWhere(PER_CAPITA.type, type)
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Total Primary Oil Consumption")
      .andWhere(PER_CAPITA.type, type)
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
      .sum({ sum: PER_CAPITA.energy_per_capita })
      .where(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .andWhere(PER_CAPITA.energy_category, "Total Primary Oil Consumption")
      .andWhere(PER_CAPITA.type, type)
      .groupBy(PER_CAPITA.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(PER_CAPITA.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const perCapitaFlopCountriesDataQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.energy_per_capita })
      .where(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .andWhere(PER_CAPITA.energy_category, "Total Primary Oil Consumption")
      .andWhere(PER_CAPITA.type, type)
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
      name: "Quickselect flop countries (based on last year)",
      data: perCapitaFlopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: perCapitaTopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
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
            ? groupNameRaw.find((row) => row[PER_CAPITA.year] === year)[PER_CAPITA.energy_per_capita]
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
  async bySector(_, { energyUnit, sectors, groupName, yearStart, yearEnd }, { dataSources: { db } }) {
    const resRawQuery = db
      .knex(BY_SECTOR.__tableName)
      .select(
        BY_SECTOR.year,
        BY_SECTOR.sector,
        BY_SECTOR.group_type,
        BY_SECTOR.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          BY_SECTOR.final_energy,
          energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
          BY_SECTOR.final_energy,
        ])
      )
      .whereIn(BY_SECTOR.sector, sectors)
      .andWhereBetween(BY_SECTOR.year, [yearStart, yearEnd])
      .andWhere(BY_SECTOR.group_name, groupName)
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
            ? sectorRaw.find((row) => row[BY_SECTOR.year] === year)[BY_SECTOR.final_energy]
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
  async provenReserve(_, { groupNames, yearStart, yearEnd }, { dataSources: { db } }) {
    // Get all the rows necessary
    const resRawQuery = db
      .knex(PROVEN_RESERVE.__tableName)
      .select(
        PROVEN_RESERVE.year,
        PROVEN_RESERVE.group_name,
        db.knex.raw("SUM(??) * ? as ??", [PROVEN_RESERVE.proven_reserves, 1, PROVEN_RESERVE.proven_reserves])
      )
      .whereIn(PROVEN_RESERVE.group_name, groupNames)
      .andWhereBetween(PROVEN_RESERVE.year, [yearStart, yearEnd])
      .andWhere(PROVEN_RESERVE.energy_source, "Oil")
      .groupBy(PROVEN_RESERVE.year, PROVEN_RESERVE.group_name)
      .orderBy(PROVEN_RESERVE.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PROVEN_RESERVE.__tableName)
      .distinct(PROVEN_RESERVE.year)
      .whereIn(PROVEN_RESERVE.group_name, groupNames)
      .andWhereBetween(PROVEN_RESERVE.year, [yearStart, yearEnd])
      .andWhere(PROVEN_RESERVE.energy_source, "Oil")
      .orderBy(PROVEN_RESERVE.year)
      .pluck(PROVEN_RESERVE.year)
      .cache(15 * 60);

    // Get the multi-selects for this specific dimension
    const multiSelects = [];
    const subQuery = db.knex(PROVEN_RESERVE.__tableName).max(PROVEN_RESERVE.year);
    // Top 10 countries based on the last year
    const topCountriesDataQuery = db
      .knex(PROVEN_RESERVE.__tableName)
      .select(PROVEN_RESERVE.group_name)
      .sum({ sum: PROVEN_RESERVE.proven_reserves })
      .where(PROVEN_RESERVE.group_type, "country")
      .andWhere(PROVEN_RESERVE.year, subQuery)
      .andWhere(PROVEN_RESERVE.energy_source, "Oil")
      .groupBy(PROVEN_RESERVE.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(PROVEN_RESERVE.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const flopCountriesDataQuery = db
      .knex(PROVEN_RESERVE.__tableName)
      .select(PROVEN_RESERVE.group_name)
      .sum({ sum: PROVEN_RESERVE.proven_reserves })
      .where(PROVEN_RESERVE.group_type, "country")
      .andWhere(PROVEN_RESERVE.year, subQuery)
      .andWhere(PROVEN_RESERVE.energy_source, "Oil")
      .groupBy(PROVEN_RESERVE.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(PROVEN_RESERVE.group_name)
      .cache(15 * 60);
    const [resRaw, years, topCountriesData, flopCountriesData] = await Promise.all([
      resRawQuery,
      yearsQuery,
      topCountriesDataQuery,
      flopCountriesDataQuery,
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: topCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: flopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });

    return {
      multiSelects,
      categories: years,
      series: groupNames.map((groupName) => {
        const groupNameRaw = resRaw.filter((row) => {
          return row[PROVEN_RESERVE.group_name] === groupName;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          groupNameRaw.find((row) => row[PROVEN_RESERVE.year] === year)
            ? groupNameRaw.find((row) => row[PROVEN_RESERVE.year] === year)[PROVEN_RESERVE.proven_reserves]
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
  async total(_, { yearStart, yearEnd, groupNames, energyUnit, type }, { dataSources: { db } }) {
    const resRawQuery = db
      .knex(TOTAL.__tableName)
      .select(
        TOTAL.year,
        TOTAL.energy_family,
        TOTAL.group_type,
        TOTAL.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          TOTAL.energy,
          energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
          TOTAL.energy,
        ])
      )
      .where(TOTAL.energy_family, "Oil")
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .andWhere(TOTAL.type, type)
      .whereIn(TOTAL.group_name, groupNames)
      .groupBy(TOTAL.year, TOTAL.energy_family, TOTAL.source, TOTAL.group_type, TOTAL.group_name)
      .orderBy(TOTAL.energy_family, TOTAL.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.year)
      .where(TOTAL.energy_family, "Oil")
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .andWhere(TOTAL.type, type)
      .whereIn(TOTAL.group_name, groupNames)
      .orderBy(TOTAL.year)
      .pluck(TOTAL.year)
      .cache(15 * 60);

    // Get the multi-selects for this specific dimension
    const multiSelects = [];
    const subQuery = db.knex(TOTAL.__tableName).max(TOTAL.year);
    // Top 10 countries based on the last year
    const topCountriesDataQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name)
      .sum({ sum: TOTAL.energy })
      .where(TOTAL.group_type, "country")
      .andWhere(TOTAL.year, subQuery)
      .andWhere(TOTAL.type, type)
      .andWhere(TOTAL.energy_family, "Oil")
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const flopCountriesDataQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name)
      .sum({ sum: TOTAL.energy })
      .where(TOTAL.group_type, "country")
      .andWhere(TOTAL.year, subQuery)
      .andWhere(TOTAL.type, type)
      .andWhere(TOTAL.energy_family, "Oil")
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);

    const [resRaw, years, topCountriesData, flopCountriesData] = await Promise.all([
      resRawQuery,
      yearsQuery,
      topCountriesDataQuery,
      flopCountriesDataQuery,
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: topCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: flopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
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
            ? groupNameRaw.find((row) => row[TOTAL.year] === year)[TOTAL.energy]
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
  async scenari(_, __, { dataSources: { db } }): Promise<Oil["oldScenari"]> {
    const res = await db
      .knex(EXTRAPOLATION.__tableName)
      .whereNotNull(EXTRAPOLATION.scenario)
      .andWhere(EXTRAPOLATION.type, "Scenario")
      .distinct(EXTRAPOLATION.scenario)
      .orderBy(EXTRAPOLATION.scenario)
      .pluck(EXTRAPOLATION.scenario)
      .cache(15 * 60);
    // Filter the historical data because it will all be displayed
    return res.map((scenario) => ({ name: scenario, color: stringToColor(scenario) }));
  },
  async curves(_, __, { dataSources: { db } }): Promise<Oil["oldCurves"]> {
    return await db
      .knex(EXTRAPOLATION.__tableName)
      .distinct(EXTRAPOLATION.extrapolation_curve)
      .andWhere(EXTRAPOLATION.type, "Extrapolation")
      .whereNotNull(EXTRAPOLATION.extrapolation_curve)
      .orderBy(EXTRAPOLATION.extrapolation_curve)
      .pluck(EXTRAPOLATION.extrapolation_curve)
      .cache(15 * 60);
  },
  async reserves(_, __, { dataSources: { db } }): Promise<Oil["oldUrrs"]> {
    return await db
      .knex(EXTRAPOLATION.__tableName)
      .distinct(EXTRAPOLATION.oil_reserves_label)
      .whereNotNull(EXTRAPOLATION.oil_reserves_label)
      .andWhere(EXTRAPOLATION.type, "Extrapolation")
      .orderBy(EXTRAPOLATION.oil_reserves_label)
      .pluck(EXTRAPOLATION.oil_reserves_label)
      .cache(15 * 60);
  },
  async extrapolation(_, { scenari, reserve, curves, yearStart, yearEnd }, { dataSources: { db } }) {
    // Always fetch historical curve with the Data filter on scenario : 1 serie
    // serie : [{name: "the scenario", data : [1, 2, 3] }]
    // Fetch the scenari (multiple series)
    // Fetch all the extrapolations (multiple series)
    // Format each
    // Aggregate all

    // Always fetch historical curve with the "Historical Data" filter on source_scenario : 1 serie
    const historicalRawQuery = db
      .knex(EXTRAPOLATION.__tableName)
      .select(EXTRAPOLATION.year, EXTRAPOLATION.scenario, EXTRAPOLATION.oil_production)
      .where(EXTRAPOLATION.type, "Historical Data")
      .andWhereBetween(EXTRAPOLATION.year, [yearStart, yearEnd])
      .orderBy(EXTRAPOLATION.year)
      .cache(15 * 60);
    // Get all the historical data years.
    const historicalYearsQuery = db
      .knex(EXTRAPOLATION.__tableName)
      .select(EXTRAPOLATION.year)
      .where(EXTRAPOLATION.type, "Historical Data")
      .andWhereBetween(EXTRAPOLATION.year, [yearStart, yearEnd])
      .pluck(EXTRAPOLATION.year)
      .cache(15 * 60);

    // Fetch all the scenari asked (multiple series)
    const scenariRawQuery = db
      .knex(EXTRAPOLATION.__tableName)
      .select(EXTRAPOLATION.year, EXTRAPOLATION.scenario, EXTRAPOLATION.oil_production)
      .whereIn(EXTRAPOLATION.scenario, scenari)
      .andWhere(EXTRAPOLATION.type, "Scenario")
      .andWhereBetween(EXTRAPOLATION.year, [yearStart, yearEnd])
      .orderBy(EXTRAPOLATION.year)
      .cache(15 * 60);
    // Get scenari years with Same filter as scenariRaw
    const scenariYearsQuery = db
      .knex(EXTRAPOLATION.__tableName)
      .select(EXTRAPOLATION.year)
      .whereIn(EXTRAPOLATION.scenario, scenari)
      .andWhere(EXTRAPOLATION.type, "Scenario")
      .pluck(EXTRAPOLATION.year)
      .cache(15 * 60);
    // Fetch all the extrapolations, multiple curves and scenari possible (multiple series)
    const extrapolationRawQuery = db
      .knex(EXTRAPOLATION.__tableName)
      .select(
        EXTRAPOLATION.year,
        EXTRAPOLATION.scenario,
        EXTRAPOLATION.extrapolation_curve,
        EXTRAPOLATION.oil_production
      )
      // Multiple scenari possible
      .whereIn(EXTRAPOLATION.scenario, scenari)
      // Multiple curves possible
      .whereIn(EXTRAPOLATION.extrapolation_curve, curves)
      .andWhereBetween(EXTRAPOLATION.year, [yearStart, yearEnd])
      .andWhere(EXTRAPOLATION.oil_reserves_label, reserve)
      .andWhere(EXTRAPOLATION.type, "Extrapolation")
      .orderBy(EXTRAPOLATION.year)
      .cache(15 * 60);
    // Get extrapolation years with Same filter as scenariRaw
    const extrapolationYearsQuery = db
      .knex(EXTRAPOLATION.__tableName)
      .select(EXTRAPOLATION.year)
      // Multiple scenari possible
      .whereIn(EXTRAPOLATION.scenario, scenari)
      // Multiple curves possible
      .whereIn(EXTRAPOLATION.extrapolation_curve, curves)
      .andWhereBetween(EXTRAPOLATION.year, [yearStart, yearEnd])
      .andWhere(EXTRAPOLATION.oil_reserves_label, reserve)
      .andWhere(EXTRAPOLATION.type, "Extrapolation")
      .pluck(EXTRAPOLATION.year)
      .cache(15 * 60);
    const [historicalRaw, historicalYears, scenariRaw, scenariYears, extrapolationRaw, extrapolationYears] =
      await Promise.all([
        historicalRawQuery,
        historicalYearsQuery,
        scenariRawQuery,
        scenariYearsQuery,
        extrapolationRawQuery,
        extrapolationYearsQuery,
      ]);

    // Delete and sort duplicated years
    const distinctYears = [...new Set([...extrapolationYears, ...scenariYears, ...historicalYears])];
    const sortedYears = distinctYears.sort();

    // Format raw to match serie type
    const historicalSerie = {
      name: "Historical",
      data: sortedYears.map((year) =>
        // Fill missing year with null
        historicalRaw.find((row) => row[EXTRAPOLATION.year] === year)
          ? historicalRaw.find((row) => row[EXTRAPOLATION.year] === year)[EXTRAPOLATION.oil_production]
          : null
      ) as number[],
      dashStyle: "Solid",
      color: "#000000",
    };

    const scenariSeries = scenari.map((scenario) => {
      const scenarioRaw = scenariRaw.filter((row) => {
        return row[EXTRAPOLATION.scenario] === scenario;
      });
      const data = sortedYears.map((year) =>
        // Fill missing year with null
        scenarioRaw.find((row) => row[EXTRAPOLATION.year] === year)
          ? scenarioRaw.find((row) => row[EXTRAPOLATION.year] === year)[EXTRAPOLATION.oil_production]
          : null
      );
      return {
        name: scenario,
        data: data as number[],
        dashStyle: "Solid",
        type: "spline",
        color: stringToColor(scenario),
      };
    });

    const groupedExtrapolationSerieRaw = [];
    extrapolationRaw.forEach((row) => {
      const title = `${row[EXTRAPOLATION.scenario]} - ${row[EXTRAPOLATION.extrapolation_curve]}`;
      const index = groupedExtrapolationSerieRaw.findIndex((o) => o.title === title);
      if (index === -1) {
        groupedExtrapolationSerieRaw.push({
          title,
          unsortedData: [row],
          scenario: row[EXTRAPOLATION.scenario],
          curve: row[EXTRAPOLATION.extrapolation_curve],
        });
      } else {
        groupedExtrapolationSerieRaw[index].unsortedData.push(row);
      }
    });
    // Format for series's type
    const extrapolationSeries = groupedExtrapolationSerieRaw.map((extrapolation) => {
      const data = sortedYears.map((year) =>
        // Fill missing year with null
        extrapolation.unsortedData.find((row) => row[EXTRAPOLATION.year] === year)
          ? extrapolation.unsortedData.find((row) => row[EXTRAPOLATION.year] === year)[EXTRAPOLATION.oil_production]
          : null
      );
      // Set different dashStyle per curve type.
      let dashStyle;
      switch (extrapolation.curve) {
        case "Hubbert":
          dashStyle = "LongDash";
          break;
        case "Square":
          dashStyle = "ShortDot";
          break;
        case "Triangle":
          dashStyle = "ShortDashDot";
          break;
        case "Hubbert asym with plateau":
          dashStyle = "DashDot";
          break;
        default:
          dashStyle = "Dash";
      }
      return {
        name: extrapolation.title,
        data: data as number[],
        dashStyle,
        type: "spline",
        color: stringToColor(extrapolation.scenario),
      };
    });
    return {
      categories: sortedYears,
      series: [historicalSerie, ...scenariSeries, ...extrapolationSeries],
    };
  },

  async oldExtrapolation(_, { scenari, urr, curves, yearStart, yearEnd }, { dataSources: { db } }) {
    // Always fetch historical curve with the Data filter on scenario : 1 serie
    // serie : [{name: "the scenario", data : [1, 2, 3] }]
    // Fetch the scenari (multiple series)
    // Fetch all the extrapolations (multiple series)
    // Format each
    // Aggregate all

    // Always fetch historical curve with the "Historical - Data" filter on source_scenario : 1 serie
    const historicalRawQuery = db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .select(OLD_EXTRAPOLATION.year, OLD_EXTRAPOLATION.source_scenario, OLD_EXTRAPOLATION.conventional_oil_production)
      .where(OLD_EXTRAPOLATION.source_scenario, "Historical - Data")
      // Get only one curve because historical data is duplicated for each curve
      .andWhere(OLD_EXTRAPOLATION.extrapolation_curve, "Square")
      // Get only one urr because historical data is duplicated for each urr
      .andWhere(OLD_EXTRAPOLATION.urr, 2100)
      .andWhereBetween(OLD_EXTRAPOLATION.year, [yearStart, yearEnd])
      .orderBy(OLD_EXTRAPOLATION.year)
      .cache(15 * 60);
    // Get all the historical data years.
    const historicalYearsQuery = db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .select(OLD_EXTRAPOLATION.year)
      .where(OLD_EXTRAPOLATION.source_scenario, "Historical - Data")
      // Get only one curve because historical data is duplicated for each curve
      .andWhere(OLD_EXTRAPOLATION.extrapolation_curve, "Square")
      // Get only one urr because historical data is duplicated for each urr
      .andWhere(OLD_EXTRAPOLATION.urr, 2100)
      .andWhereBetween(OLD_EXTRAPOLATION.year, [yearStart, yearEnd])
      .pluck(OLD_EXTRAPOLATION.year)
      .cache(15 * 60);

    // Fetch all the scenari asked (multiple series)
    const scenariRawQuery = db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .select(OLD_EXTRAPOLATION.year, OLD_EXTRAPOLATION.source_scenario, OLD_EXTRAPOLATION.conventional_oil_production)
      .whereIn(OLD_EXTRAPOLATION.source_scenario, scenari)
      .whereNot(OLD_EXTRAPOLATION.source_scenario, "Historical - Data")
      .andWhereBetween(OLD_EXTRAPOLATION.year, [yearStart, yearEnd])
      .andWhere(OLD_EXTRAPOLATION.urr, 2100)
      .andWhere(OLD_EXTRAPOLATION.is_extrapolation, false)
      // Select a fixed curve because there's scenario data is duplicated per scenario.
      .andWhere(OLD_EXTRAPOLATION.extrapolation_curve, "Square")
      .orderBy(OLD_EXTRAPOLATION.year)
      .cache(15 * 60);

    // Get scenari years with Same filter as scenariRaw
    const scenariYearsQuery = db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .select(OLD_EXTRAPOLATION.year)
      .whereIn(OLD_EXTRAPOLATION.source_scenario, scenari)
      .whereNot(OLD_EXTRAPOLATION.source_scenario, "Historical - Data")
      .andWhereBetween(OLD_EXTRAPOLATION.year, [yearStart, yearEnd])
      .andWhere(OLD_EXTRAPOLATION.urr, 2100)
      .andWhere(OLD_EXTRAPOLATION.is_extrapolation, false)
      .andWhere(OLD_EXTRAPOLATION.extrapolation_curve, "Square")
      .pluck(OLD_EXTRAPOLATION.year)
      .cache(15 * 60);
    // Fetch all the extrapolations, multiple curves and scenari possible (multiple series)
    const extrapolationRawQuery = db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .select(
        OLD_EXTRAPOLATION.year,
        OLD_EXTRAPOLATION.source_scenario,
        OLD_EXTRAPOLATION.extrapolation_curve,
        OLD_EXTRAPOLATION.conventional_oil_production
      )
      // Multiple scenari possible
      .whereIn(OLD_EXTRAPOLATION.source_scenario, scenari)
      .whereNot(OLD_EXTRAPOLATION.source_scenario, "Historical - Data")
      // Multiple curves possible
      .whereIn(OLD_EXTRAPOLATION.extrapolation_curve, curves)
      .andWhereBetween(OLD_EXTRAPOLATION.year, [yearStart, yearEnd])
      .andWhere(OLD_EXTRAPOLATION.urr, urr)
      .andWhere(OLD_EXTRAPOLATION.is_extrapolation, true)
      .orderBy(OLD_EXTRAPOLATION.year)
      .cache(15 * 60);
    // Get extrapolation years with Same filter as scenariRaw
    const extrapolationYearsQuery = db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .select(OLD_EXTRAPOLATION.year)
      .whereIn(OLD_EXTRAPOLATION.source_scenario, scenari)
      .andWhereBetween(OLD_EXTRAPOLATION.year, [yearStart, yearEnd])
      .andWhere(OLD_EXTRAPOLATION.urr, urr)
      .andWhere(OLD_EXTRAPOLATION.is_extrapolation, true)
      .whereIn(OLD_EXTRAPOLATION.extrapolation_curve, curves)
      .pluck(OLD_EXTRAPOLATION.year)
      .cache(15 * 60);
    const [historicalRaw, historicalYears, scenariRaw, scenariYears, extrapolationRaw, extrapolationYears] =
      await Promise.all([
        historicalRawQuery,
        historicalYearsQuery,
        scenariRawQuery,
        scenariYearsQuery,
        extrapolationRawQuery,
        extrapolationYearsQuery,
      ]);

    // Delete and sort duplicated years
    const distinctYears = [...new Set([...extrapolationYears, ...scenariYears, ...historicalYears])];
    const sortedYears = distinctYears.sort();

    // Format raw to match serie type
    const historicalSerie = {
      name: "Historical",
      data: sortedYears.map((year) =>
        // Fill missing year with null
        historicalRaw.find((row) => row[OLD_EXTRAPOLATION.year] === year)
          ? historicalRaw.find((row) => row[OLD_EXTRAPOLATION.year] === year)[
              OLD_EXTRAPOLATION.conventional_oil_production
            ]
          : null
      ) as number[],
      dashStyle: "Solid",
      color: "#000000",
    };

    const scenariSeries = scenari.map((scenario) => {
      const scenarioRaw = scenariRaw.filter((row) => {
        return row[OLD_EXTRAPOLATION.source_scenario] === scenario;
      });
      const data = sortedYears.map((year) =>
        // Fill missing year with null
        scenarioRaw.find((row) => row[OLD_EXTRAPOLATION.year] === year)
          ? scenarioRaw.find((row) => row[OLD_EXTRAPOLATION.year] === year)[
              OLD_EXTRAPOLATION.conventional_oil_production
            ]
          : null
      );
      return {
        name: scenario,
        data: data as number[],
        dashStyle: "Solid",
        type: "spline",
        color: stringToColor(scenario),
      };
    });

    const groupedExtrapolationSerieRaw = [];
    extrapolationRaw.forEach((row) => {
      const title = `${row[OLD_EXTRAPOLATION.source_scenario]} - ${row[OLD_EXTRAPOLATION.extrapolation_curve]}`;
      const index = groupedExtrapolationSerieRaw.findIndex((o) => o.title === title);
      if (index === -1) {
        groupedExtrapolationSerieRaw.push({
          title,
          unsortedData: [row],
          scenario: row[OLD_EXTRAPOLATION.source_scenario],
          curve: row[OLD_EXTRAPOLATION.extrapolation_curve],
        });
      } else {
        groupedExtrapolationSerieRaw[index].unsortedData.push(row);
      }
    });
    // Format for series's type
    const extrapolationSeries = groupedExtrapolationSerieRaw.map((extrapolation) => {
      const data = sortedYears.map((year) =>
        // Fill missing year with null
        extrapolation.unsortedData.find((row) => row[OLD_EXTRAPOLATION.year] === year)
          ? extrapolation.unsortedData.find((row) => row[OLD_EXTRAPOLATION.year] === year)[
              OLD_EXTRAPOLATION.conventional_oil_production
            ]
          : null
      );
      // Set different dashStyle per curve type.
      let dashStyle;
      switch (extrapolation.curve) {
        case "Hubbert":
          dashStyle = "LongDash";
          break;
        case "Square":
          dashStyle = "ShortDot";
          break;
        case "Triangle":
          dashStyle = "ShortDashDot";
          break;
        case "Hubbert asym with plateau":
          dashStyle = "DashDot";
          break;
        default:
          dashStyle = "Dash";
      }
      return {
        name: extrapolation.title,
        data: data as number[],
        dashStyle,
        type: "spline",
        color: stringToColor(extrapolation.scenario),
      };
    });
    return {
      categories: sortedYears,
      series: [historicalSerie, ...scenariSeries, ...extrapolationSeries],
    };
  },
  async oldScenari(_, __, { dataSources: { db } }): Promise<Oil["oldScenari"]> {
    const res = await db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .whereNot(OLD_EXTRAPOLATION.source_scenario, "Historical - Data")
      .distinct(OLD_EXTRAPOLATION.source_scenario)
      .orderBy(OLD_EXTRAPOLATION.source_scenario)
      .pluck(OLD_EXTRAPOLATION.source_scenario)
      .cache(15 * 60);
    // Filter the historical data because it will all be displayed
    return res.map((scenario) => ({ name: scenario, color: stringToColor(scenario) }));
  },
  async oldCurves(_, __, { dataSources: { db } }): Promise<Oil["oldCurves"]> {
    return await db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .distinct(OLD_EXTRAPOLATION.extrapolation_curve)
      .orderBy(OLD_EXTRAPOLATION.extrapolation_curve)
      .pluck(OLD_EXTRAPOLATION.extrapolation_curve)
      .cache(15 * 60);
  },
  async oldUrrs(_, __, { dataSources: { db } }): Promise<Oil["oldUrrs"]> {
    return await db
      .knex(OLD_EXTRAPOLATION.__tableName)
      .distinct(OLD_EXTRAPOLATION.urr)
      .orderBy(OLD_EXTRAPOLATION.urr)
      .pluck(OLD_EXTRAPOLATION.urr)
      .cache(15 * 60);
  },
};
export default oil;
