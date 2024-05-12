import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
import { GasResolvers, Gas, EnergyUnit, GasDimensions } from "../types";
import energyUnits from "../utils/energyUnits";
import energyMultiplier from "../utils/energyMultiplier";
import {
  IEA_API_final_cons_gas_by_sector_prod as BY_SECTOR,
  FOSSIL_RESERVES_bp_fossil_with_zones_prod as PROVEN_RESERVE,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT,
  WORLD_ENERGY_HISTORY_primary_energy_prod as TOTAL,
  ENERGY_PER_CAPITA_energy_per_capita_prod as PER_CAPITA,
} from "../dbSchema";
import typeColor from "../utils/typeColor";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";

const gas: GasResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<Gas["mdInfos"]> {
    return await getMdInfos(db.knex, "gas");
  },
  energyUnits(): Gas["energyUnits"] {
    return energyUnits;
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<Gas["multiSelects"]> {
    const res: Gas["multiSelects"] = [];

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
  dimensions(): Gas["dimensions"] {
    return Object.values(GasDimensions);
  },
  async countries(_, __, { dataSources: { db } }): Promise<Gas["countries"]> {
    return await distinctCountries(BY_SECTOR.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<Gas["groups"]> {
    return await distinctGroups(BY_SECTOR.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Gas["zones"]> {
    return await distinctZones(BY_SECTOR.__tableName, db.knex);
  },
  async sectors(_, __, { dataSources: { db } }): Promise<Gas["sectors"]> {
    const res = await db
      .knex(BY_SECTOR.__tableName)
      .distinct(BY_SECTOR.sector)
      .whereNotNull(BY_SECTOR.sector)
      .orderBy(BY_SECTOR.sector, "asc")
      .pluck(BY_SECTOR.sector)
      .cache(15 * 60);
    return res.map((sector) => ({ name: sector, color: typeColor(sector) }));
  },

  async bySector(
    _,
    { energyUnit, sectors, groupName, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Gas["bySector"]> {
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
      .where(TOTAL.energy_family, "Gas")
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
      .where(TOTAL.energy_family, "Gas")
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
      .andWhere(TOTAL.energy_family, "Gas")
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
      .andWhere(TOTAL.energy_family, "Gas")
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
      name: "Quickselect flop countries (based on last year)",
      data: flopCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
    });
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: topCountriesData.map((groupName) => ({ name: groupName, color: stringToColor(groupName) })),
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
      .andWhere(PROVEN_RESERVE.energy_source, "Gas")
      .groupBy(PROVEN_RESERVE.year, PROVEN_RESERVE.group_name)
      .orderBy(PROVEN_RESERVE.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PROVEN_RESERVE.__tableName)
      .distinct(PROVEN_RESERVE.year)
      .whereIn(PROVEN_RESERVE.group_name, groupNames)
      .andWhereBetween(PROVEN_RESERVE.year, [yearStart, yearEnd])
      .andWhere(PROVEN_RESERVE.energy_source, "Gas")
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
      .andWhere(PROVEN_RESERVE.energy_source, "Gas")
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
      .andWhere(PROVEN_RESERVE.energy_source, "Gas")
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
  async perCapita(_, { groupNames, energyUnit, yearStart, yearEnd }, { dataSources: { db } }) {
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
      .andWhere(PER_CAPITA.energy_category, "Gas")
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Gas")
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
      .andWhere(PER_CAPITA.energy_category, "Gas")
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
      .andWhere(PER_CAPITA.energy_category, "Gas")
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
};
export default gas;
