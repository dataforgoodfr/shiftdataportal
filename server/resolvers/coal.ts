import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
import { CoalResolvers, Coal, EnergyUnit, CoalDimensions } from "../types";
import energyUnits from "../utils/energyUnits";
import energyMultiplier from "../utils/energyMultiplier";
import {
  country_multiselect_groups as MULTI_SELECT,
  WORLD_ENERGY_HISTORY_primary_energy_prod as TOTAL,
  ENERGY_PER_CAPITA_energy_per_capita_prod as PER_CAPITA,
} from "../dbSchema";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";

const coal: CoalResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<Coal["mdInfos"]> {
    return await getMdInfos(db.knex, "coal");
  },
  energyUnits(): Coal["energyUnits"] {
    return energyUnits;
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<Coal["multiSelects"]> {
    const res: Coal["multiSelects"] = [];

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
  dimensions(): Coal["dimensions"] {
    return Object.values(CoalDimensions);
  },
  async countries(_, __, { dataSources: { db } }): Promise<Coal["countries"]> {
    return await distinctCountries(TOTAL.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<Coal["groups"]> {
    return await distinctGroups(TOTAL.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Coal["zones"]> {
    return await distinctZones(TOTAL.__tableName, db.knex);
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
      .where(TOTAL.energy_family, "Coal")
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
      .where(TOTAL.energy_family, "Coal")
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
      .andWhere(TOTAL.energy_family, "Coal")
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
      .andWhere(TOTAL.energy_family, "Coal")
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
      .andWhere(PER_CAPITA.energy_category, "Coal")
      .andWhere(TOTAL.type, type)
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Coal")
      .andWhere(TOTAL.type, type)
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
      .andWhere(PER_CAPITA.energy_category, "Coal")
      .andWhere(TOTAL.type, type)
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
      .andWhere(PER_CAPITA.energy_category, "Coal")
      .andWhere(TOTAL.type, type)
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
export default coal;
