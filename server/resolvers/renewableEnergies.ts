import { distinctGroups, distinctZones } from "./helpers";
import energyMultiplier from "../utils/energyMultiplier";
import energyUnits from "../utils/energyUnits";
import { RenewableEnergiesResolvers, RenewableEnergies, RenewableEnergiesDimensions, EnergyUnit } from "../types";
import {
  WORLD_ENERGY_HISTORY_renewable_primary_energy_prod as BY_ENERGY_FAMILY,
  WORLD_ENERGY_HISTORY_renewable_share_of_primary_energy_prod as SHARE,
  WORLD_ENERGY_HISTORY_renewable_primary_energy_prod as TOTAL,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT
} from "../dbSchema";
import groupBy from "../utils/groupBy";
import typeColor from "../utils/typeColor";
import stringToColor from "../utils/stringToColor";
import getMdInfos from "./helpers/getMdInfos";

const renewableEnergies: RenewableEnergiesResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<RenewableEnergies["mdInfos"]> {
    return await getMdInfos(db.knex, "renewable-energy");
  },
  energyUnits(): RenewableEnergies["energyUnits"] {
    return energyUnits;
  },
  async energyFamilies(_, { type }, { dataSources: { db } }): Promise<RenewableEnergies["energyFamilies"]> {
    // Require "source" argument because energy families differ when source changes.
    const resRaw = await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .select(BY_ENERGY_FAMILY.energy_family)
      .sum({ sumEnergy: BY_ENERGY_FAMILY.energy })
      .where(BY_ENERGY_FAMILY.type, type)
      .groupBy(BY_ENERGY_FAMILY.energy_family)
      .orderBy("sumEnergy", "DESC")
      .pluck(BY_ENERGY_FAMILY.energy_family)
      .cache(15 * 60);
    const res = resRaw.map(energyFamily => ({ name: energyFamily, color: typeColor(energyFamily) }));
    return res;
  },
  async countries(_, __, { dataSources: { db } }): Promise<RenewableEnergies["countries"]> {
    const res = await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .distinct("group_name")
      .where({ group_type: "country" })
      .whereNotNull("group_name")
      .orderBy("group_name", "asc")
      .cache(15 * 60);
    return res.map(groupName => ({ name: groupName.group_name, color: stringToColor(groupName.group_name) }));
  },
  async groups(_, __, { dataSources: { db } }): Promise<RenewableEnergies["groups"]> {
    return await distinctGroups(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<RenewableEnergies["zones"]> {
    return await distinctZones(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<RenewableEnergies["multiSelects"]> {
    const res: RenewableEnergies["multiSelects"] = [];
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
          .map(countryObject => countryObject.country)
          .map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
      });
    }
    return res;
  },
  async types(_, __, { dataSources: { db } }): Promise<RenewableEnergies["types"]> {
    return await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .distinct(BY_ENERGY_FAMILY.type)
      .orderBy(BY_ENERGY_FAMILY.type, "ASC")
      .whereNotNull(BY_ENERGY_FAMILY.type)
      .pluck("type")
      .cache(15 * 60);
  },
  dimensions(): RenewableEnergies["dimensions"] {
    return Object.values(RenewableEnergiesDimensions);
  },
  async byEnergyFamily(
    _,
    { energyFamilies, energyUnit, groupName = "", type, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<RenewableEnergies["byEnergyFamily"]> {
    const [resRaw, years] = await Promise.all([
      // resRaw
      db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(
          BY_ENERGY_FAMILY.year,
          BY_ENERGY_FAMILY.energy_family,
          BY_ENERGY_FAMILY.group_type,
          BY_ENERGY_FAMILY.group_name,
          db.knex.raw("SUM(??)::numeric * ? as ??", [
            BY_ENERGY_FAMILY.energy,
            energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
            BY_ENERGY_FAMILY.energy
          ])
        )
        .whereIn(BY_ENERGY_FAMILY.energy_family, energyFamilies)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .andWhere(BY_ENERGY_FAMILY.type, type)
        .andWhere(BY_ENERGY_FAMILY.group_name, groupName)
        .groupBy(
          BY_ENERGY_FAMILY.year,
          BY_ENERGY_FAMILY.energy_family,
          BY_ENERGY_FAMILY.source,
          BY_ENERGY_FAMILY.group_type,
          BY_ENERGY_FAMILY.group_name
        )
        .orderBy(BY_ENERGY_FAMILY.energy_family, BY_ENERGY_FAMILY.year)
        .cache(15 * 60),
      // years
      // Get all the years with the same filters
      db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .distinct(BY_ENERGY_FAMILY.year)
        .whereIn(BY_ENERGY_FAMILY.energy_family, energyFamilies)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .andWhere(BY_ENERGY_FAMILY.type, type)
        .andWhere(BY_ENERGY_FAMILY.group_name, groupName)
        .orderBy(BY_ENERGY_FAMILY.year)
        .pluck(BY_ENERGY_FAMILY.year)
        .cache(15 * 60)
    ]);
    return {
      categories: years,
      series: energyFamilies.map(energyFamily => {
        const energyFamilyRaw = resRaw.filter(row => {
          return row[BY_ENERGY_FAMILY.energy_family] === energyFamily;
        });
        const data = years.map(year =>
          // Fill missing year with null in the
          energyFamilyRaw.find(row => row[BY_ENERGY_FAMILY.year] === year)
            ? energyFamilyRaw.find(row => row[BY_ENERGY_FAMILY.year] === year)[BY_ENERGY_FAMILY.energy]
            : null
        );
        return {
          name: energyFamily,
          data: data as number[],
          color: typeColor(energyFamily)
        };
      })
    };
  },
  async shareOfPrimaryEnergy(
    _,
    { groupNames = [], type, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<RenewableEnergies["shareOfPrimaryEnergy"]> {
    const maxYearSubQuery = db.knex(SHARE.__tableName).max(SHARE.year);
    const [resRaw, years, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      // resRaw
      db
        .knex(SHARE.__tableName)
        .select(
          SHARE.year,
          SHARE.type,
          SHARE.group_name,
          db.knex.raw("SUM(??)::numeric * ? as ??", [
            SHARE.renewable_share_of_primary_energy,
            100,
            SHARE.renewable_share_of_primary_energy
          ])
        )
        .whereIn(SHARE.group_name, groupNames)
        .andWhere(SHARE.type, type)
        .andWhereBetween(SHARE.year, [yearStart, yearEnd])
        .groupBy(SHARE.year, SHARE.type, SHARE.group_name, SHARE.renewable_share_of_primary_energy)
        .orderBy(SHARE.year)
        .cache(15 * 60),
      // years
      db
        .knex(SHARE.__tableName)
        .distinct(SHARE.year)
        .whereIn(SHARE.group_name, groupNames)
        .andWhere(SHARE.type, type)
        .andWhereBetween(SHARE.year, [yearStart, yearEnd])
        .orderBy(SHARE.year)
        .pluck(SHARE.year)
        .cache(15 * 60),
      //  TotalTopCountriesData
      db
        .knex(SHARE.__tableName)
        .select(SHARE.group_name)
        .sum({ sum: SHARE.renewable_share_of_primary_energy })
        .where(SHARE.group_type, "country")
        .andWhere(SHARE.year, maxYearSubQuery)
        .andWhere(SHARE.type, type)
        .groupBy(SHARE.group_name)
        .orderBy("sum", "desc")
        .limit(10)
        .pluck(SHARE.group_name)
        .cache(15 * 60),
      // TotalFlopCountriesData
      db
        .knex(SHARE.__tableName)
        .select(SHARE.group_name)
        .sum({ sum: SHARE.renewable_share_of_primary_energy })
        .where(SHARE.group_type, "country")
        .andWhere(SHARE.year, maxYearSubQuery)
        .andWhere(SHARE.type, type)
        .groupBy(SHARE.group_name)
        .orderBy("sum", "asc")
        .limit(10)
        .pluck(SHARE.group_name)
        .cache(15 * 60)
    ]);
    // Get the multi-selects option
    const multiSelects = [];
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: TotalTopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: TotalFlopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    return {
      multiSelects,
      categories: years,
      series: groupNames.map(groupName => {
        const groupNameRaw = resRaw.filter(row => {
          return row[SHARE.group_name] === groupName;
        });
        const data = years.map(year =>
          // Fill missing year with null in the
          groupNameRaw.find(row => row[SHARE.year] === year)
            ? groupNameRaw.find(row => row[SHARE.year] === year)[SHARE.renewable_share_of_primary_energy]
            : null
        );
        return {
          name: groupName,
          data: data as number[],
          color: stringToColor(groupName)
        };
      })
    };
  },
  async total(
    _,
    { energyUnit, groupNames = [], type, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<RenewableEnergies["total"]> {
    const maxYearSubQuery = db.knex(TOTAL.__tableName).max(TOTAL.year);
    const [resRaw, years, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      // resRaw
      db
        .knex(TOTAL.__tableName)
        .select(
          TOTAL.year,
          TOTAL.type,
          TOTAL.group_name,
          db.knex.raw("SUM(??)::numeric * ? as ??", [
            TOTAL.energy,
            energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
            TOTAL.energy
          ])
        )
        .whereIn(TOTAL.group_name, groupNames)
        .andWhere(TOTAL.type, type)
        .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
        .groupBy(TOTAL.year, TOTAL.type, TOTAL.group_name)
        .orderBy(TOTAL.year)
        .cache(15 * 60),
      // years
      db
        .knex(TOTAL.__tableName)
        .distinct(TOTAL.year)
        .whereIn(TOTAL.group_name, groupNames)
        .andWhere(TOTAL.type, type)
        .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
        .orderBy(TOTAL.year)
        .pluck(TOTAL.year)
        .cache(15 * 60),
      //  TotalTopCountriesData
      db
        .knex(TOTAL.__tableName)
        .select(TOTAL.group_name)
        .sum({ sum: TOTAL.energy })
        .where(TOTAL.group_type, "country")
        .andWhere(TOTAL.year, maxYearSubQuery)
        .andWhere(TOTAL.type, type)
        .groupBy(TOTAL.group_name)
        .orderBy("sum", "desc")
        .limit(10)
        .pluck(TOTAL.group_name)
        .cache(15 * 60),
      // TotalFlopCountriesData
      db
        .knex(TOTAL.__tableName)
        .select(TOTAL.group_name)
        .sum({ sum: TOTAL.energy })
        .where(TOTAL.group_type, "country")
        .andWhere(TOTAL.year, maxYearSubQuery)
        .andWhere(TOTAL.type, type)
        .groupBy(TOTAL.group_name)
        .orderBy("sum", "asc")
        .limit(10)
        .pluck(TOTAL.group_name)
        .cache(15 * 60)
    ]);
    // Get the multi-selects option
    const multiSelects = [];
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: TotalTopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: TotalFlopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    return {
      multiSelects,
      categories: years,
      series: groupNames.map(groupName => {
        const groupNameRaw = resRaw.filter(row => {
          return row[TOTAL.group_name] === groupName;
        });
        const data = years.map(year =>
          // Fill missing year with null in the
          groupNameRaw.find(row => row[TOTAL.year] === year)
            ? groupNameRaw.find(row => row[TOTAL.year] === year)[TOTAL.energy]
            : null
        );
        return {
          name: groupName,
          data: data as number[],
          color: stringToColor(groupName)
        };
      })
    };
  }
};

export default renewableEnergies;
