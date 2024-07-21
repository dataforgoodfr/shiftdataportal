import { distinctGroups, distinctZones } from "./helpers";
import energyMultiplier from "../utils/energyMultiplier";
import energyUnits from "../utils/energyUnits";
import { NuclearResolvers, Nuclear, NuclearDimensions, EnergyUnit } from "../types";
import {
  IEA_API_nuclear_share_of_electricity_generation_prod as SHARE,
  IEA_API_nuclear_share_of_electricity_generation_prod as TOTAL,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT,
} from "../dbSchema";
import groupBy from "../utils/groupBy";
import stringToColor from "../utils/stringToColor";
import getMdInfos from "./helpers/getMdInfos";

const nuclear: NuclearResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<Nuclear["mdInfos"]> {
    return await getMdInfos(db.knex, "nuclear");
  },
  energyUnits(): Nuclear["energyUnits"] {
    return energyUnits;
  },
  async countries(_, __, { dataSources: { db } }): Promise<Nuclear["countries"]> {
    const res = await db
      .knex(TOTAL.__tableName)
      .distinct("group_name")
      .where({ group_type: "country" })
      .whereNotNull("group_name")
      .orderBy("group_name", "asc")
      .cache(15 * 60);
    return res.map((groupName) => ({ name: groupName.group_name, color: stringToColor(groupName.group_name) }));
  },
  async groups(_, __, { dataSources: { db } }): Promise<Nuclear["groups"]> {
    return await distinctGroups(TOTAL.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Nuclear["zones"]> {
    return await distinctZones(TOTAL.__tableName, db.knex);
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<Nuclear["multiSelects"]> {
    const res: Nuclear["multiSelects"] = [];
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
  dimensions(): Nuclear["dimensions"] {
    return Object.values(NuclearDimensions);
  },
  async shareOfElectricityGeneration(
    _,
    { groupNames = [], yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Nuclear["shareOfElectricityGeneration"]> {
    const maxYearSubQuery = db.knex(SHARE.__tableName).max(SHARE.year);
    const [resRaw, years, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      // resRaw
      db
        .knex(SHARE.__tableName)
        .select(
          SHARE.year,
          SHARE.group_name,
          db.knex.raw("SUM(??)::numeric * ? as ??", [
            SHARE.nuclear_share_of_electricity_generation,
            100,
            SHARE.nuclear_share_of_electricity_generation,
          ])
        )
        .whereIn(SHARE.group_name, groupNames)
        .andWhereBetween(SHARE.year, [yearStart, yearEnd])
        .groupBy(SHARE.year, SHARE.group_name)
        .orderBy(SHARE.year)
        .cache(15 * 60),
      // years
      db
        .knex(SHARE.__tableName)
        .distinct(SHARE.year)
        .whereIn(SHARE.group_name, groupNames)
        .andWhereBetween(SHARE.year, [yearStart, yearEnd])
        .orderBy(SHARE.year)
        .pluck(SHARE.year)
        .cache(15 * 60),
      //  TotalTopCountriesData
      db
        .knex(SHARE.__tableName)
        .select(SHARE.group_name)
        .sum({ sum: SHARE.nuclear_share_of_electricity_generation })
        .where(SHARE.group_type, "country")
        .andWhere(SHARE.year, maxYearSubQuery)
        .groupBy(SHARE.group_name)
        .orderBy("sum", "desc")
        .limit(10)
        .pluck(SHARE.group_name)
        .cache(15 * 60),
      // TotalFlopCountriesData
      db
        .knex(SHARE.__tableName)
        .select(SHARE.group_name)
        .sum({ sum: SHARE.nuclear_share_of_electricity_generation })
        .where(SHARE.group_type, "country")
        .andWhere(SHARE.year, maxYearSubQuery)
        .groupBy(SHARE.group_name)
        .orderBy("sum", "asc")
        .limit(10)
        .pluck(SHARE.group_name)
        .cache(15 * 60),
    ]);
    // Get the multi-selects option
    const multiSelects = [];
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
          return row[SHARE.group_name] === groupName;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          groupNameRaw.find((row) => row[SHARE.year] === year)
            ? groupNameRaw.find((row) => row[SHARE.year] === year)[SHARE.nuclear_share_of_electricity_generation]
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
    { energyUnit, groupNames = [], yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Nuclear["total"]> {
    const maxYearSubQuery = db.knex(TOTAL.__tableName).max(TOTAL.year);
    const [resRaw, years, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      // resRaw
      db
        .knex(TOTAL.__tableName)
        .select(
          TOTAL.year,
          TOTAL.group_name,
          db.knex.raw("SUM(??)::numeric * ? as ??", [
            TOTAL.nuclear,
            energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
            TOTAL.nuclear,
          ])
        )
        .whereIn(TOTAL.group_name, groupNames)
        .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
        .groupBy(TOTAL.year, TOTAL.group_name)
        .orderBy(TOTAL.year)
        .cache(15 * 60),
      // years
      db
        .knex(TOTAL.__tableName)
        .distinct(TOTAL.year)
        .whereIn(TOTAL.group_name, groupNames)
        .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
        .orderBy(TOTAL.year)
        .pluck(TOTAL.year)
        .cache(15 * 60),
      //  TotalTopCountriesData
      db
        .knex(TOTAL.__tableName)
        .select(TOTAL.group_name)
        .sum({ sum: TOTAL.nuclear })
        .where(TOTAL.group_type, "country")
        .andWhere(TOTAL.year, maxYearSubQuery)
        .groupBy(TOTAL.group_name)
        .orderBy("sum", "desc")
        .limit(10)
        .pluck(TOTAL.group_name)
        .cache(15 * 60),
      // TotalFlopCountriesData
      db
        .knex(TOTAL.__tableName)
        .select(TOTAL.group_name)
        .sum({ sum: TOTAL.nuclear })
        .where(TOTAL.group_type, "country")
        .andWhere(TOTAL.year, maxYearSubQuery)
        .groupBy(TOTAL.group_name)
        .orderBy("sum", "asc")
        .limit(10)
        .pluck(TOTAL.group_name)
        .cache(15 * 60),
    ]);
    // Get the multi-selects option
    const multiSelects = [];
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
            ? groupNameRaw.find((row) => row[TOTAL.year] === year)[TOTAL.nuclear]
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

export default nuclear;
