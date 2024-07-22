import { EnergyUnit, ElectricityDimensions, ElectricityTypes } from "../types";
import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
import energyMultiplier from "../utils/energyMultiplier";
import energyUnits from "../utils/energyUnits";
import { ElectricityResolvers, Electricity } from "../types";
import {
  IEA_API_electricity_by_energy_family_prepared_prod as BY_ENERGY_FAMILY,
  ENERGY_PER_CAPITA_energy_per_capita_prod as PER_CAPITA,
  country_multiselect_groups as MULTI_SELECT,
  WORLD_ENERGY_HISTORY_electricity_capacity_prod as CAPACITY,
} from "../dbSchema";

import typeColor from "../utils/typeColor";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";

const electricity: ElectricityResolvers = {
  async mdInfos(_, {}, { dataSources: { db } }): Promise<Electricity["mdInfos"]> {
    return await getMdInfos(db.knex, "electricity");
  },
  energyUnits(): Electricity["energyUnits"] {
    return energyUnits;
  },
  async generationEnergyFamilies(_, __, { dataSources: { db } }): Promise<Electricity["generationEnergyFamilies"]> {
    const res = await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .select(BY_ENERGY_FAMILY.energy_family)
      .sum({ sumEnergy: BY_ENERGY_FAMILY.final_energy })
      .groupBy(BY_ENERGY_FAMILY.energy_family)
      .orderBy("sumEnergy", "DESC")
      .pluck(BY_ENERGY_FAMILY.energy_family)
      .cache(15 * 60);
    return res.map((energyFamily) => ({ name: energyFamily, color: typeColor(energyFamily) }));
  },
  async capacityEnergyFamilies(_, __, { dataSources: { db } }): Promise<Electricity["capacityEnergyFamilies"]> {
    const res = await db
      .knex(CAPACITY.__tableName)
      .select(CAPACITY.energy_family)
      .sum({ sumEnergy: CAPACITY.power })
      .groupBy(CAPACITY.energy_family)
      .orderBy("sumEnergy", "DESC")
      .pluck(CAPACITY.energy_family)
      .cache(15 * 60);
    return res.map((energyFamily) => ({ name: energyFamily, color: typeColor(energyFamily) }));
  },
  types(): Electricity["types"] {
    return Object.values(ElectricityTypes);
  },
  async countries(_, __, { dataSources: { db } }): Promise<Electricity["countries"]> {
    return await distinctCountries(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<Electricity["multiSelects"]> {
    const res: Electricity["multiSelects"] = [];

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
  async groups(_, __, { dataSources: { db } }): Promise<Electricity["groups"]> {
    return await distinctGroups(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Electricity["zones"]> {
    return await distinctZones(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  dimensions(): Electricity["dimensions"] {
    return Object.values(ElectricityDimensions);
  },
  async byEnergyFamily(
    _,
    { capacityEnergyFamilies, generationEnergyFamilies, energyUnit, groupName, yearStart, yearEnd, type },
    { dataSources: { db } }
  ): Promise<Electricity["byEnergyFamily"]> {
    if (type === "Capacity") {
      const resRawQuery = db
        .knex(CAPACITY.__tableName)
        .select(CAPACITY.year, CAPACITY.energy_family, CAPACITY.group_type, CAPACITY.group_name)
        .sum(CAPACITY.power)
        .whereIn(CAPACITY.energy_family, capacityEnergyFamilies)
        .andWhereBetween(CAPACITY.year, [yearStart, yearEnd])
        .andWhere(CAPACITY.group_name, groupName)
        .groupBy(CAPACITY.year, CAPACITY.energy_family, CAPACITY.group_type, CAPACITY.group_name)
        .orderBy(CAPACITY.energy_family, CAPACITY.year)
        .cache(15 * 60);

      // Get all the years with the same filters
      const yearsQuery = db
        .knex(CAPACITY.__tableName)
        .distinct(CAPACITY.year)
        .whereIn(CAPACITY.energy_family, capacityEnergyFamilies)
        .andWhereBetween(CAPACITY.year, [yearStart, yearEnd])
        .andWhere(CAPACITY.group_name, groupName)
        .orderBy(CAPACITY.year)
        .pluck(CAPACITY.year)
        .cache(15 * 60);
      const [resRaw, years] = await Promise.all([resRawQuery, yearsQuery]);
      return {
        categories: years,
        series: capacityEnergyFamilies.map((energyFamily) => {
          const energyFamilyRaw = resRaw.filter((row) => {
            return row[CAPACITY.energy_family] === energyFamily;
          });
          const data = years.map((year) =>
            // Fill missing year with null in the
            energyFamilyRaw.find((row) => row[CAPACITY.year] === year)
              ? energyFamilyRaw.find((row) => row[CAPACITY.year] === year).sum
              : null
          );
          return {
            name: energyFamily,
            data: data as number[],
            color: typeColor(energyFamily),
          };
        }),
      };
    } else {
      const resRawQuery = db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(
          BY_ENERGY_FAMILY.year,
          BY_ENERGY_FAMILY.energy_family,
          BY_ENERGY_FAMILY.group_type,
          BY_ENERGY_FAMILY.group_name,
          db.knex.raw("SUM(??) * ? as ??", [
            BY_ENERGY_FAMILY.final_energy,
            energyUnit ? energyMultiplier(EnergyUnit.TWh, energyUnit) : 1,
            BY_ENERGY_FAMILY.final_energy,
          ])
        )
        .whereIn(BY_ENERGY_FAMILY.energy_family, generationEnergyFamilies)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .andWhere(BY_ENERGY_FAMILY.group_name, groupName)
        .groupBy(
          BY_ENERGY_FAMILY.year,
          BY_ENERGY_FAMILY.energy_family,
          BY_ENERGY_FAMILY.source,
          BY_ENERGY_FAMILY.group_type,
          BY_ENERGY_FAMILY.group_name
        )
        .orderBy(BY_ENERGY_FAMILY.energy_family, BY_ENERGY_FAMILY.year)
        .cache(15 * 60);
      // Get all the years with the same filters
      const yearsQuery = db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .distinct(BY_ENERGY_FAMILY.year)
        .whereIn(BY_ENERGY_FAMILY.energy_family, generationEnergyFamilies)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .andWhere(BY_ENERGY_FAMILY.group_name, groupName)
        .orderBy(BY_ENERGY_FAMILY.year)
        .pluck(BY_ENERGY_FAMILY.year)
        .cache(15 * 60);
      const [resRaw, years] = await Promise.all([resRawQuery, yearsQuery]);
      return {
        categories: years,
        series: generationEnergyFamilies.map((energyFamily) => {
          const energyFamilyRaw = resRaw.filter((row) => {
            return row[BY_ENERGY_FAMILY.energy_family] === energyFamily;
          });
          const data = years.map((year) =>
            // Fill missing year with null in the
            energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)
              ? energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)[BY_ENERGY_FAMILY.final_energy]
              : null
          );
          return {
            name: energyFamily,
            data: data as number[],
            color: typeColor(energyFamily),
          };
        }),
      };
    }
  },
  async perCapita(
    _,
    { energyUnit, groupNames, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<Electricity["perCapita"]> {
    // Get all the rows necessary
    const resRawQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(
        PER_CAPITA.year,
        PER_CAPITA.group_name,
        db.knex.raw("SUM(??) * ? as ??", [
          PER_CAPITA.energy_per_capita,
          energyUnit ? energyMultiplier(EnergyUnit.TWh, energyUnit) : 1,
          PER_CAPITA.energy_per_capita,
        ])
      )
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Total Electricity Consumption")
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Total Electricity Consumption")
      .orderBy(PER_CAPITA.year)
      .pluck(PER_CAPITA.year)
      .cache(15 * 60);

    // Get the multi-selects for this specific dimension
    const multiSelects = [];
    const subQuery = db.knex(BY_ENERGY_FAMILY.__tableName).max(BY_ENERGY_FAMILY.year);
    // Top 10 countries based on the last year
    const perCapitaTopCountriesDataQuery = db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.energy_per_capita })
      .where(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .andWhere(PER_CAPITA.energy_category, "Total Electricity Consumption")
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
      .andWhere(PER_CAPITA.energy_category, "Total Electricity Consumption")
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
    { energyUnit, groupNames, yearStart, yearEnd, type },
    { dataSources: { db } }
  ): Promise<Electricity["total"]> {
    if (type === "Capacity") {
      const resRawQuery = db
        .knex(CAPACITY.__tableName)
        .select(CAPACITY.year, CAPACITY.group_name)
        .sum(CAPACITY.power)
        .whereIn(CAPACITY.group_name, groupNames)
        .andWhereBetween(CAPACITY.year, [yearStart, yearEnd])
        .groupBy(CAPACITY.year, CAPACITY.group_name)
        .orderBy(CAPACITY.year)
        .cache(15 * 60);
      const yearsQuery = db
        .knex(CAPACITY.__tableName)
        .distinct(CAPACITY.year)
        .whereIn(CAPACITY.group_name, groupNames)
        .andWhereBetween(CAPACITY.year, [yearStart, yearEnd])
        .orderBy(CAPACITY.year)
        .pluck(CAPACITY.year)
        .cache(15 * 60);

      // Get the multi-selects option
      const multiSelects = [];
      const maxYearSubQuery = db.knex(CAPACITY.__tableName).max(CAPACITY.year);
      const TotalTopCountriesDataQuery = db
        .knex(CAPACITY.__tableName)
        .select(CAPACITY.group_name)
        .sum({ sum: CAPACITY.power })
        .where(CAPACITY.group_type, "country")
        .andWhere(CAPACITY.year, maxYearSubQuery)
        .groupBy(CAPACITY.group_name)
        .orderBy("sum", "desc")
        .limit(10)
        .pluck(CAPACITY.group_name)
        .cache(15 * 60);
      const TotalFlopCountriesDataQuery = db
        .knex(CAPACITY.__tableName)
        .select(CAPACITY.group_name)
        .sum({ sum: CAPACITY.power })
        .where(CAPACITY.group_type, "country")
        .andWhere(CAPACITY.year, maxYearSubQuery)
        .groupBy(CAPACITY.group_name)
        .orderBy("sum", "asc")
        .limit(10)
        .pluck(CAPACITY.group_name)
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
            return row[CAPACITY.group_name] === groupName;
          });
          const data = years.map((year) =>
            // Fill missing year with null in the
            groupNameRaw.find((row) => row[CAPACITY.year] === year)
              ? groupNameRaw.find((row) => row[CAPACITY.year] === year).sum
              : null
          );
          return {
            name: groupName,
            data: data as number[],
            color: stringToColor(groupName),
          };
        }),
      };
    } else {
      const resRawQuery = db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(
          BY_ENERGY_FAMILY.year,
          BY_ENERGY_FAMILY.group_name,
          db.knex.raw("SUM(??) * ? as ??", [
            BY_ENERGY_FAMILY.final_energy,
            energyUnit ? energyMultiplier(EnergyUnit.TWh, energyUnit) : 1,
            BY_ENERGY_FAMILY.final_energy,
          ])
        )
        .whereIn(BY_ENERGY_FAMILY.group_name, groupNames)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .groupBy(BY_ENERGY_FAMILY.year, BY_ENERGY_FAMILY.group_name)
        .orderBy(BY_ENERGY_FAMILY.year)
        .cache(15 * 60);
      const yearsQuery = db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .distinct(BY_ENERGY_FAMILY.year)
        .whereIn(BY_ENERGY_FAMILY.group_name, groupNames)
        .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
        .orderBy(BY_ENERGY_FAMILY.year)
        .pluck(BY_ENERGY_FAMILY.year)
        .cache(15 * 60);

      // Get the multi-selects option
      const multiSelects = [];
      const maxYearSubQuery = db.knex(BY_ENERGY_FAMILY.__tableName).max(BY_ENERGY_FAMILY.year);
      const TotalTopCountriesDataQuery = db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(BY_ENERGY_FAMILY.group_name)
        .sum({ sum: BY_ENERGY_FAMILY.final_energy })
        .where(BY_ENERGY_FAMILY.group_type, "country")
        .andWhere(BY_ENERGY_FAMILY.year, maxYearSubQuery)
        .groupBy(BY_ENERGY_FAMILY.group_name)
        .orderBy("sum", "desc")
        .limit(10)
        .pluck(BY_ENERGY_FAMILY.group_name)
        .cache(15 * 60);

      const TotalFlopCountriesDataQuery = db
        .knex(BY_ENERGY_FAMILY.__tableName)
        .select(BY_ENERGY_FAMILY.group_name)
        .sum({ sum: BY_ENERGY_FAMILY.final_energy })
        .where(BY_ENERGY_FAMILY.group_type, "country")
        .andWhere(BY_ENERGY_FAMILY.year, maxYearSubQuery)
        .groupBy(BY_ENERGY_FAMILY.group_name)
        .orderBy("sum", "asc")
        .limit(10)
        .pluck(BY_ENERGY_FAMILY.group_name)
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
            return row[BY_ENERGY_FAMILY.group_name] === groupName;
          });
          const data = years.map((year) =>
            // Fill missing year with null in the
            groupNameRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)
              ? groupNameRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)[BY_ENERGY_FAMILY.final_energy]
              : null
          );
          return {
            name: groupName,
            data: data as number[],
            color: stringToColor(groupName),
          };
        }),
      };
    }
  },
};
export default electricity;
