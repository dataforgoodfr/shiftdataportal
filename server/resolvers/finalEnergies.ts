import { EnergyUnit, FinalEnergies, FinalEnergiesResolvers, FinalEnergiesDimensions } from "../types";
import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
import energyMultiplier from "../utils/energyMultiplier";
import energyUnits from "../utils/energyUnits";
import {
  FINAL_ENERGY_CONSUMPTION_final_cons_by_energy_family_full_prod as BY_ENERGY_FAMILY,
  IEA_API_final_cons_by_sector_prod as BY_SECTOR,
  ENERGY_PER_CAPITA_energy_per_capita_prod as PER_CAPITA,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT,
} from "../dbSchema";
import typeColor from "../utils/typeColor";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";
const finalEnergiesResolvers: FinalEnergiesResolvers = {
  async mdInfos(_, {}, { dataSources: { db } }): Promise<FinalEnergies["mdInfos"]> {
    return await getMdInfos(db.knex, "final-energy");
  },
  energyUnits(): FinalEnergies["energyUnits"] {
    return energyUnits;
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<FinalEnergies["multiSelects"]> {
    const res: FinalEnergies["multiSelects"] = [];

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
  async energyFamilies(_, __, { dataSources: { db } }): Promise<FinalEnergies["energyFamilies"]> {
    // Require "source" argument because energy families differ when source changes.
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
  async sectors(_, __, { dataSources: { db } }): Promise<FinalEnergies["sectors"]> {
    const res = await db
      .knex(BY_SECTOR.__tableName)
      .select(BY_SECTOR.sector)
      .sum({ sumEnergy: BY_SECTOR.final_energy })
      .groupBy(BY_SECTOR.sector)
      .orderBy("sumEnergy", "DESC")
      .pluck(BY_SECTOR.sector)
      .cache(15 * 60);
    return res.map((sector) => ({ name: sector, color: typeColor(sector) }));
  },
  async countries(_, __, { dataSources: { db } }): Promise<FinalEnergies["countries"]> {
    return await distinctCountries(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<FinalEnergies["groups"]> {
    return await distinctGroups(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<FinalEnergies["zones"]> {
    return await distinctZones(BY_ENERGY_FAMILY.__tableName, db.knex);
  },
  dimensions(): FinalEnergies["dimensions"] {
    return Object.values(FinalEnergiesDimensions);
  },
  async byEnergyFamily(
    _,
    { energyFamilies, energyUnit, groupName, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<FinalEnergies["byEnergyFamily"]> {
    const resRawQuery = db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .select(
        BY_ENERGY_FAMILY.year,
        BY_ENERGY_FAMILY.energy_family,
        BY_ENERGY_FAMILY.group_type,
        BY_ENERGY_FAMILY.group_name,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          BY_ENERGY_FAMILY.final_energy,
          energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
          BY_ENERGY_FAMILY.final_energy,
        ])
      )
      .modify((builder) => {
        if (energyFamilies) {
          builder.whereIn(BY_ENERGY_FAMILY.energy_family, energyFamilies);
        }
      })
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
      .modify((builder) => {
        if (energyFamilies) {
          builder.whereIn(BY_ENERGY_FAMILY.energy_family, energyFamilies);
        }
      })
      .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
      .andWhere(BY_ENERGY_FAMILY.group_name, groupName)
      .orderBy(BY_ENERGY_FAMILY.year)
      .pluck(BY_ENERGY_FAMILY.year)
      .cache(15 * 60);
    const [resRaw, years] = await Promise.all([resRawQuery, yearsQuery]);
    let filledEnergyFamilies = [];
    const series = [];
    resRaw.forEach((item) => {
      const energyFamily = item[BY_ENERGY_FAMILY.energy_family];
      if (!filledEnergyFamilies.includes(energyFamily)) {
        filledEnergyFamilies.push(energyFamily);
        const energyFamilyRaw = resRaw.filter((row) => {
          return row[BY_ENERGY_FAMILY.energy_family] === energyFamily;
        });
        const data = years.map((year) =>
          // Fill missing year with null in the
          energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)
            ? energyFamilyRaw.find((row) => row[BY_ENERGY_FAMILY.year] === year)[BY_ENERGY_FAMILY.final_energy]
            : null
        );
        series.push({
          name: energyFamily,
          data: data as number[],
          color: typeColor(energyFamily),
        });
      }
    });

    return {
      categories: years,
      series,
    };
  },
  async bySector(
    _,
    { sectors, energyUnit, groupName, yearEnd, yearStart },
    { dataSources: { db } }
  ): Promise<FinalEnergies["bySector"]> {
    const resRawQuery = db
      .knex(BY_SECTOR.__tableName)
      .select(
        BY_SECTOR.year,
        BY_SECTOR.sector,
        BY_SECTOR.group_type,
        BY_SECTOR.group_name,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
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
  async perCapita(
    _,
    { energyUnit, groupNames, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<FinalEnergies["perCapita"]> {
    // Get all the rows necessary
    const resRawQuery = await db
      .knex(PER_CAPITA.__tableName)
      .select(
        PER_CAPITA.year,
        PER_CAPITA.group_name,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          PER_CAPITA.energy_per_capita,
          energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
          PER_CAPITA.energy_per_capita,
        ])
      )
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Total Final Energy Consumption")
      .groupBy(PER_CAPITA.year, PER_CAPITA.group_name)
      .orderBy(PER_CAPITA.year)
      .cache(15 * 60);
    // Get all the years with the same filters
    const yearsQuery = await db
      .knex(PER_CAPITA.__tableName)
      .distinct(PER_CAPITA.year)
      .whereIn(PER_CAPITA.group_name, groupNames)
      .andWhereBetween(PER_CAPITA.year, [yearStart, yearEnd])
      .andWhere(PER_CAPITA.energy_category, "Total Final Energy Consumption")
      .orderBy(PER_CAPITA.year)
      .pluck(PER_CAPITA.year)
      .cache(15 * 60);

    // Get the multi-selects for this specific dimension
    const multiSelects = [];
    const subQuery = db.knex(PER_CAPITA.__tableName).max(PER_CAPITA.year);
    // Top 10 countries based on the last year
    const perCapitaTopCountriesDataQuery = await db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.energy_per_capita })
      .where(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .andWhere(PER_CAPITA.energy_category, "Total Final Energy Consumption")
      .groupBy(PER_CAPITA.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(PER_CAPITA.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const perCapitaFlopCountriesDataQuery = await db
      .knex(PER_CAPITA.__tableName)
      .select(PER_CAPITA.group_name)
      .sum({ sum: PER_CAPITA.energy_per_capita })
      .where(PER_CAPITA.group_type, "country")
      .andWhere(PER_CAPITA.year, subQuery)
      .andWhere(PER_CAPITA.energy_category, "Total Final Energy Consumption")
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
    { energyUnit, groupNames, yearStart, yearEnd },
    { dataSources: { db } }
  ): Promise<FinalEnergies["total"]> {
    const resRawQuery = await db
      .knex(BY_ENERGY_FAMILY.__tableName)
      .select(
        BY_ENERGY_FAMILY.year,
        BY_ENERGY_FAMILY.group_name,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          BY_ENERGY_FAMILY.final_energy,
          energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
          BY_ENERGY_FAMILY.final_energy,
        ])
      )
      .whereIn(BY_ENERGY_FAMILY.group_name, groupNames)
      .andWhereBetween(BY_ENERGY_FAMILY.year, [yearStart, yearEnd])
      .groupBy(BY_ENERGY_FAMILY.year, BY_ENERGY_FAMILY.group_name)
      .orderBy(BY_ENERGY_FAMILY.year)
      .cache(15 * 60);
    const yearsQuery = await db
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
    const TotalTopCountriesDataQuery = await db
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

    const TotalFlopCountriesDataQuery = await db
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
  },
};
export default finalEnergiesResolvers;
