import { distinctGroups, distinctZones } from "./helpers";
const { performance } = require("perf_hooks");
import energyMultiplier from "../utils/energyMultiplier";
import energyUnits from "../utils/energyUnits";
import { PrimaryEnergiesResolvers, PrimaryEnergies, PrimaryEnergiesDimensions, EnergyUnit } from "../types";
import {
  WORLD_ENERGY_HISTORY_primary_energy_prod as BY_ENERGY_FAMILY,
  ENERGY_PER_CAPITA_energy_per_capita_prod as PER_CAPITA,
  country_multiselect_groups as MULTI_SELECT,
} from "../dbSchema";
import groupBy from "../utils/groupBy";
import typeColor from "../utils/typeColor";
import stringToColor from "../utils/stringToColor";
import getMdInfos from "./helpers/getMdInfos";

const primaryEnergies: PrimaryEnergiesResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<PrimaryEnergies["mdInfos"]> {
    return await getMdInfos(db.knex, "primary-energy");
  },
  energyUnits(): PrimaryEnergies["energyUnits"] {
    return energyUnits;
  },
  async energyFamilies(_, { type }, { dataSources: { db } }): Promise<PrimaryEnergies["energyFamilies"]> {
    const start = performance.now();

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
    const res = resRaw.map((energyFamily) => ({ name: energyFamily, color: typeColor(energyFamily) }));
    console.log("energyFamilies end", performance.now() - start);
    return res;
  },
  async countries(_, __, { dataSources: { db } }): Promise<PrimaryEnergies["countries"]> {
    const res = await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .distinct("group_name")
      .where({ group_type: "country" })
      .whereNotNull("group_name")
      .orderBy("group_name", "asc")
      .cache(15 * 60);
    return res.map((groupName) => ({ name: groupName.group_name, color: stringToColor(groupName.group_name) }));
  },
  async groups(_, __, { dataSources: { db } }): Promise<PrimaryEnergies["groups"]> {
    return await distinctGroups(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<PrimaryEnergies["zones"]> {
    return await distinctZones(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<PrimaryEnergies["multiSelects"]> {
    const res: PrimaryEnergies["multiSelects"] = [];
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
  async types(_, __, { dataSources: { db } }): Promise<PrimaryEnergies["types"]> {
    return await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .distinct(BY_ENERGY_FAMILY.type)
      .orderBy(BY_ENERGY_FAMILY.type, "ASC")
      .whereNotNull(BY_ENERGY_FAMILY.type)
      .pluck("type")
      .cache(15 * 60);
  },
  dimensions(): PrimaryEnergies["dimensions"] {
    return Object.values(PrimaryEnergiesDimensions);
  },
  async byEnergyFamily(
    _,
    { energyFamilies, energyUnit, groupName, type, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<PrimaryEnergies["byEnergyFamily"]> {
    const [resRaw, years] = await Promise.all([
      // resRaw
      db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(
          BY_ENERGY_FAMILY.year,
          BY_ENERGY_FAMILY.energy_family,
          BY_ENERGY_FAMILY.group_type,
          BY_ENERGY_FAMILY.group_name,
          db.knex.raw("SUM(??) * ? as ??", [
            BY_ENERGY_FAMILY.energy,
            energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
            BY_ENERGY_FAMILY.energy,
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
        .cache(15 * 60),
    ]);
    return {
      categories: years,
      series: energyFamilies.map((energyFamily) => {
        const energyFamilyRaw = resRaw.filter((row) => {
          return row[BY_ENERGY_FAMILY.energy_family] === energyFamily;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)
            ? energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)[BY_ENERGY_FAMILY.energy]
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
    { energyUnit, groupNames, yearStart, yearEnd, type },
    { dataSources: { db } }
  ): Promise<PrimaryEnergies["perCapita"]> {
    const multiSelects = [];
    const subQuery = db.knex(PER_CAPITA.__tableName).max(PER_CAPITA.year);
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
      .andWhere(
        PER_CAPITA.energy_category,
        type !== "Production" ? "Total Primary Energy Consumption" : "Total Primary Energy Production"
      )
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(
        PER_CAPITA.energy_category,
        type !== "Production" ? "Total Primary Energy Consumption" : "Total Primary Energy Production"
      )
      .orderBy(PER_CAPITA.year)
      .pluck(PER_CAPITA.year)
      .cache(15 * 60);
    const perCapitaTopCountriesDataQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.energy_per_capita })
      .where(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .andWhere(
        PER_CAPITA.energy_category,
        type !== "Production" ? "Total Primary Energy Consumption" : "Total Primary Energy Production"
      )
      .groupBy(PER_CAPITA.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(PER_CAPITA.group_name)
      .cache(15 * 60);
    const perCapitaFlopCountriesDataQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.energy_per_capita })
      .where(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .andWhere(
        PER_CAPITA.energy_category,
        type !== "Production" ? "Total Primary Energy Consumption" : "Total Primary Energy Production"
      )
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
    // Last 10 countries based on the last year
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
  async total(
    _,
    { energyUnit, groupNames, type, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<PrimaryEnergies["total"]> {
    const maxYearSubQuery = db.knex(BY_ENERGY_FAMILY.__tableName).max(BY_ENERGY_FAMILY.year);
    const [resRaw, years, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      // resRaw
      db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(
          BY_ENERGY_FAMILY.year,
          BY_ENERGY_FAMILY.type,
          BY_ENERGY_FAMILY.group_name,
          db.knex.raw("SUM(??) * ? as ??", [
            BY_ENERGY_FAMILY.energy,
            energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
            BY_ENERGY_FAMILY.energy,
          ])
        )
        .whereIn(BY_ENERGY_FAMILY.group_name, groupNames)
        .andWhere(BY_ENERGY_FAMILY.type, type)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .groupBy(BY_ENERGY_FAMILY.year, BY_ENERGY_FAMILY.type, BY_ENERGY_FAMILY.group_name)
        .orderBy(BY_ENERGY_FAMILY.year)
        .cache(15 * 60),
      // years
      db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .distinct(BY_ENERGY_FAMILY.year)
        .whereIn(BY_ENERGY_FAMILY.group_name, groupNames)
        .andWhere(BY_ENERGY_FAMILY.type, type)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .orderBy(BY_ENERGY_FAMILY.year)
        .pluck(BY_ENERGY_FAMILY.year)
        .cache(15 * 60),
      //  TotalTopCountriesData
      db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(BY_ENERGY_FAMILY.group_name)
        .sum({ sum: BY_ENERGY_FAMILY.energy })
        .where(BY_ENERGY_FAMILY.group_type, "country")
        .andWhere(BY_ENERGY_FAMILY.year, maxYearSubQuery)
        .andWhere(BY_ENERGY_FAMILY.type, type)
        .groupBy(BY_ENERGY_FAMILY.group_name)
        .orderBy("sum", "desc")
        .limit(10)
        .pluck(BY_ENERGY_FAMILY.group_name)
        .cache(15 * 60),
      // TotalFlopCountriesData
      db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(BY_ENERGY_FAMILY.group_name)
        .sum({ sum: BY_ENERGY_FAMILY.energy })
        .where(BY_ENERGY_FAMILY.group_type, "country")
        .andWhere(BY_ENERGY_FAMILY.year, maxYearSubQuery)
        .andWhere(BY_ENERGY_FAMILY.type, type)
        .groupBy(BY_ENERGY_FAMILY.group_name)
        .orderBy("sum", "asc")
        .limit(10)
        .pluck(BY_ENERGY_FAMILY.group_name)
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
          return row[BY_ENERGY_FAMILY.group_name] === groupName;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          groupNameRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)
            ? groupNameRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)[BY_ENERGY_FAMILY.energy]
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

export default primaryEnergies;
