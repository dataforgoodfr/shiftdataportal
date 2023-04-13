import { Co2ImportsExports, Co2ImportsExportsResolvers, Co2eqUnit, Co2ImportsExportsDimensions } from "../types";
import cO2Units from "../utils/cO2Units";
import {
  CO2_CONSUMPTION_BASED_ACCOUNTING_eora_co2_trade_by_country_prod as BY_COUNTRY,
  CO2_CONSUMPTION_BASED_ACCOUNTING_eora_co2_trade_by_sector as BY_SECTOR,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT
} from "../dbSchema";
import stringToColor from "../utils/stringToColor";
import getMdInfos from "./helpers/getMdInfos";
import typeColor from "../utils/typeColor";
import cO2EqMultiplier from "../utils/cO2EqMultiplier";
import groupBy from "../utils/groupBy";

const Co2ImportsExports: Co2ImportsExportsResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<Co2ImportsExports["mdInfos"]> {
    return await getMdInfos(db.knex, "co2-imports-exports");
  },
  emissionsUnits() {
    return cO2Units;
  },
  dimensions(): Co2ImportsExports["dimensions"] {
    return Object.values(Co2ImportsExportsDimensions);
  },
  async countries(_, { dimension }, { dataSources: { db } }): Promise<Co2ImportsExports["countries"]> {
    switch (dimension) {
      case "total":
      case "byCountry":
      case "byContinent":
        const res1 = await db
          .knex(BY_COUNTRY.__tableName)
          .distinct(BY_COUNTRY.country)
          .whereNotNull(BY_COUNTRY.country)
          .orderBy(BY_COUNTRY.country, "asc")
          .pluck(BY_COUNTRY.country)
          .cache(15 * 60);
        return res1.map(groupName => ({ name: groupName, color: stringToColor(groupName) }));
      case "bySector":
        const res2 = await db
          .knex(BY_COUNTRY.__tableName)
          .distinct(BY_COUNTRY.country)
          .whereNotNull(BY_COUNTRY.country)
          .orderBy(BY_COUNTRY.country, "asc")
          .pluck(BY_COUNTRY.country)
          .cache(15 * 60);
        return res2.map(groupName => ({ name: groupName, color: stringToColor(groupName) }));
    }
  },
  async types(_, { dimension }, { dataSources: { db } }): Promise<Co2ImportsExports["types"]> {
    switch (dimension) {
      case "total":
      case "byCountry":
      case "byContinent":
        return await db
          .knex(BY_COUNTRY.__tableName)
          .distinct(BY_COUNTRY.type)
          .pluck(BY_COUNTRY.type)
          .limit(5)
          .cache(15 * 60);
      case "bySector":
        return await db
          .knex(BY_SECTOR.__tableName)
          .distinct(BY_SECTOR.type)
          .pluck(BY_SECTOR.type)
          .limit(5)
          .cache(15 * 60);
    }
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<Co2ImportsExports["multiSelects"]> {
    const res: Co2ImportsExports["multiSelects"] = [];
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
  async total(_, { types, groupNames, emissionsUnit }, { dataSources: { db } }): Promise<Co2ImportsExports["total"]> {
    const resRawQuery = db
      .knex(BY_COUNTRY.__tableName)
      .select(
        BY_COUNTRY.country,
        BY_COUNTRY.type,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          BY_COUNTRY.co2,
          emissionsUnit ? cO2EqMultiplier(Co2eqUnit.MtCo2eq, emissionsUnit) : 1,
          BY_COUNTRY.co2
        ])
      )
      .whereIn(BY_COUNTRY.country, groupNames)
      .whereIn(BY_COUNTRY.type, types)
      .groupBy(BY_COUNTRY.country, BY_COUNTRY.type)
      .cache(15 * 60);

    // Get the multi-selects option
    const multiSelects = [];
    const TotalTopCountriesDataQuery = db
      .knex(BY_COUNTRY.__tableName)
      .select(BY_COUNTRY.country)
      .sum({ sum: BY_COUNTRY.co2 })
      .groupBy(BY_COUNTRY.country)
      .whereIn(BY_COUNTRY.type, types)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(BY_COUNTRY.country)
      .cache(15 * 60);

    const TotalFlopCountriesDataQuery = db
      .knex(BY_COUNTRY.__tableName)
      .select(BY_COUNTRY.country)
      .sum({ sum: BY_COUNTRY.co2 })
      .whereIn(BY_COUNTRY.type, types)
      .groupBy(BY_COUNTRY.country)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(BY_COUNTRY.country)
      .cache(15 * 60);
    const [resRaw, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      resRawQuery,
      TotalTopCountriesDataQuery,
      TotalFlopCountriesDataQuery
    ]);
    multiSelects.push({
      name: "Quickselect top countries",
      data: TotalTopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    multiSelects.push({
      name: "Quickselect flop countries",
      data: TotalFlopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    return {
      multiSelects,
      categories: groupNames,
      series: types.map(type => {
        const typeRaw = resRaw.filter(row => {
          return row[BY_COUNTRY.type] === type;
        });

        const data = groupNames.map(groupName =>
          // Fill missing type with null in the
          typeRaw.find(row => row[BY_COUNTRY.country] === groupName)
            ? typeRaw.find(row => row[BY_COUNTRY.country] === groupName)[BY_COUNTRY.co2]
            : null
        );
        return {
          name: type,
          data: data as number[],
          color: stringToColor(type)
        };
      })
    };
  },
  async bySector(
    _,
    { types, groupName, numberOfSectors },
    { dataSources: { db } }
  ): Promise<Co2ImportsExports["byCountry"]> {
    const raw = (
      await Promise.all(
        types.map(async type => {
          // Get top x countries
          const mainSectorsToRaw = await db
            .knex(BY_SECTOR.__tableName)
            .select("*")
            .andWhere(BY_SECTOR.type, type)
            .andWhere(BY_SECTOR.group_name, groupName)
            .orderBy(BY_SECTOR.co2, "desc")
            .limit(numberOfSectors)
            .cache(15 * 60);
          // Get rest of the other sectors except the first x sectors
          const restSectorsToRaw = await db.knex
            .sum("total")
            .from(function() {
              // Sum off all the sectors after specific offset
              this.sum({ total: BY_SECTOR.co2 })
                .select(BY_SECTOR.sector, BY_SECTOR.type)
                .from(BY_SECTOR.__tableName)
                .andWhere(BY_SECTOR.group_name, groupName)
                .andWhere(BY_SECTOR.type, type)
                .groupBy(BY_SECTOR.sector, BY_SECTOR.type)
                .orderBy("total", "desc")
                .offset(numberOfSectors)
                .as("sub");
            })
            .cache(15 * 60);
          // Put the results in the same array.
          const res = [...mainSectorsToRaw, { sector: "Others", co2: restSectorsToRaw[0].sum, type }];
          return res;
        })
      )
    )
      // Transform [[], []] to []
      .reduce((total, currentValue) => [...total, ...currentValue], []);
    // Get all the sector names that were found (each one will be unique)
    const topSectorsTo = [...new Set(raw.map(sector => sector[BY_SECTOR.sector]))];
    const series = topSectorsTo.map(sector => {
      // Get the rows for the corresponding sector
      const sectorRaw = raw.filter(row => row[BY_SECTOR.sector] === sector);
      return {
        name: sector,
        color: typeColor(sector),
        data: types.map(type =>
          // Fills missing type with null if this sector wasn't selected as a top sector.
          sectorRaw.find(row => row[BY_SECTOR.type] === type)
            ? sectorRaw.find(row => row[BY_SECTOR.type] === type)[BY_SECTOR.co2]
            : null
        )
      };
    });
    return {
      categories: types,
      series: series as any
    };
  },
  async byCountry(
    _,
    { types, groupName, numberOfCountries },
    { dataSources: { db } }
  ): Promise<Co2ImportsExports["byCountry"]> {
    const raw = (
      await Promise.all(
        types.map(async type => {
          // Get top x countries
          const mainCountriesToRaw = await db
            .knex(BY_COUNTRY.__tableName)
            .select("*")
            .andWhere(BY_COUNTRY.type, type)
            .andWhere(BY_COUNTRY.country, groupName)
            .orderBy(BY_COUNTRY.co2, "desc")
            .limit(numberOfCountries)
            .cache(15 * 60);
          // Get rest of the other countries except the first x countries
          const restCountriesToRaw = await db.knex
            .sum("total")
            .from(function() {
              // Sum off all the countries after specific offset
              this.sum({ total: BY_COUNTRY.co2 })
                .select(BY_COUNTRY.country_to, BY_COUNTRY.type)
                .from(BY_COUNTRY.__tableName)
                .andWhere(BY_COUNTRY.country, groupName)
                .andWhere(BY_COUNTRY.type, type)
                .groupBy(BY_COUNTRY.country_to, BY_COUNTRY.type)
                .orderBy("total", "desc")
                .offset(numberOfCountries)
                .as("sub");
            })
            .cache(15 * 60);
          // Put the results in the same array.
          const res = [...mainCountriesToRaw, { country_to: "Others", co2: restCountriesToRaw[0].sum, type }];
          return res;
        })
      )
    )
      // Transform [[], []] to []
      .reduce((total, currentValue) => [...total, ...currentValue], []);
    // Get all the country names that were found (each one will be unique)
    const topCountriesTo = [...new Set(raw.map(country => country[BY_COUNTRY.country_to]))];
    const series = topCountriesTo.map(country => {
      // Get the rows for the corresponding country
      const countryRaw = raw.filter(row => row[BY_COUNTRY.country_to] === country);
      return {
        name: country,
        color: stringToColor(country),
        data: types.map(type =>
          // Fills missing type with null if this country wasn't selected as a top country.
          countryRaw.find(row => row[BY_COUNTRY.type] === type)
            ? countryRaw.find(row => row[BY_COUNTRY.type] === type)[BY_COUNTRY.co2]
            : null
        )
      };
    });
    return {
      categories: types,
      series: series as any
    };
  },
  async byContinent(_, { types, groupName }, { dataSources: { db } }): Promise<Co2ImportsExports["byContinent"]> {
    const raw = (
      await Promise.all(
        types.map(async type => {
          const continentsToRaw = await db
            .knex(BY_COUNTRY.__tableName)
            .select(BY_COUNTRY.continent_to, BY_COUNTRY.type)
            .sum({ total: BY_COUNTRY.co2 })
            .andWhere(BY_COUNTRY.type, type)
            .andWhere(BY_COUNTRY.country, groupName)
            .groupBy(BY_COUNTRY.continent_to, BY_COUNTRY.type)
            .orderBy("total", "desc")
            .cache(15 * 60);
          return continentsToRaw;
        })
      )
    )
      // Transform [[], []] to [] (put everything in one array)
      .reduce((total, currentValue) => [...total, ...currentValue], []);
    // Get all the country names that were found (each one will be unique)
    const uniqueContinentToNames = [...new Set(raw.map(country => country[BY_COUNTRY.continent_to]))];
    const series = uniqueContinentToNames.map(continent => {
      // Get the rows for the corresponding continent
      const continentRaw = raw.filter(row => row[BY_COUNTRY.continent_to] === continent);
      return {
        name: continent,
        color: stringToColor(continent),
        data: types.map(type =>
          // Fills missing type with null if this continent wasn't selected as a top continent.
          continentRaw.find(row => row[BY_COUNTRY.type] === type)
            ? continentRaw.find(row => row[BY_COUNTRY.type] === type)["total"]
            : null
        )
      };
    });
    return {
      categories: types,
      series: series
    };
  }
  // async bySector(_, { types, groupName }, { dataSources: { db } }): Promise<Co2ImportsExports["bySector"]> {
  //   const resRawQuery = db
  //     .knex(BY_SECTOR.__tableName)
  //     .select(BY_SECTOR.co2, BY_SECTOR.sector, BY_SECTOR.type)
  //     .whereIn(BY_SECTOR.type, types)
  //     .andWhere(BY_SECTOR.group_name, groupName)
  //     .cache(15 * 60);
  //   const sectorsQuery = db
  //     .knex(BY_SECTOR.__tableName)
  //     .select(BY_SECTOR.sector)
  //     .sum({ sum: BY_SECTOR.co2 })
  //     .where(BY_SECTOR.group_name, groupName)
  //     .andWhere(BY_SECTOR.type, "CO2 Imports")
  //     .groupBy(BY_SECTOR.sector)
  //     .orderBy("sum", "desc")
  //     .pluck(BY_SECTOR.sector)
  //     .cache(15 * 60);
  //   const [resRaw, sectors] = await Promise.all([resRawQuery, sectorsQuery]);
  //   const series = sectors.map(sector => {
  //     // Get the rows for the corresponding sector
  //     const sectorRaw = resRaw.filter(row => row[BY_SECTOR.sector] === sector);
  //     return {
  //       name: sector,
  //       color: typeColor(sector),
  //       data: types.map(type =>
  //         // Fill missing type with null in the
  //         sectorRaw.find(row => row[BY_SECTOR.type] === type)
  //           ? sectorRaw.find(row => row[BY_SECTOR.type] === type)[BY_SECTOR.co2]
  //           : null
  //       )
  //     };
  //   });
  //   return {
  //     categories: types,
  //     series
  //   };
  // }
};
export default Co2ImportsExports;
