import { FOSSIL_IMPORT_EXPORT_us_eia_fossil_zones_prod as TOTAL } from "../dbSchema";
import stringToColor from "../utils/stringToColor";
import { ImportExportResolvers, ImportExport, ImportExportDimensions } from "../types";
import getMdInfos from "./helpers/getMdInfos";

const importExport: ImportExportResolvers = {
  async mdInfos(_, {}, { dataSources: { db } }): Promise<ImportExport["mdInfos"]> {
    return await getMdInfos(db.knex, "co2-imports-exports");
  },
  dimensions(): ImportExport["dimensions"] {
    return Object.values(ImportExportDimensions);
  },
  async total(_, { groupNames, types, energyFamily, yearStart, yearEnd }, { dataSources: { db } }) {
    const resRawQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name, TOTAL.type, TOTAL.year)
      .sum(TOTAL.energy)
      .whereIn(TOTAL.group_name, groupNames)
      .whereIn(TOTAL.type, types)
      .andWhere(TOTAL.energy_source, energyFamily)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .groupBy(TOTAL.group_name, TOTAL.type, TOTAL.year)
      .cache(15 * 60);

    // Get all the years with the same filters
    const yearsQuery = db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.year)
      .whereIn(TOTAL.group_name, groupNames)
      .whereIn(TOTAL.type, types)
      .andWhere(TOTAL.energy_source, energyFamily)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
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
      .whereIn(TOTAL.type, types)
      .whereNotNull(TOTAL.group_name)
      .andWhere(TOTAL.group_type, "country")
      .andWhere(TOTAL.year, subQuery)
      .andWhere(TOTAL.energy_source, energyFamily)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);

    // Last 10 countries based on the last year
    const perCapitaFlopCountriesDataQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name)
      .sum({ sum: TOTAL.energy })
      .whereIn(TOTAL.type, types)
      .whereNotNull(TOTAL.group_name)
      .andWhere(TOTAL.group_type, "country")
      .andWhere(TOTAL.year, subQuery)
      .andWhere(TOTAL.energy_source, energyFamily)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);
    const [resRaw, years, topCountriesData, perCapitaFlopCountriesData] = await Promise.all([
      resRawQuery,
      yearsQuery,
      topCountriesDataQuery,
      perCapitaFlopCountriesDataQuery
    ]);
    multiSelects.push({
      name: "Quickselect top countries (based on last year)",
      data: topCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    multiSelects.push({
      name: "Quickselect flop countries (based on last year)",
      data: perCapitaFlopCountriesData.map(groupName => ({ name: groupName, color: stringToColor(groupName) }))
    });
    const series = [];
    types.map(type => {
      groupNames.map(groupName => {
        const groupNameRaw = resRaw.filter(row => {
          return row[TOTAL.group_name] === groupName && row[TOTAL.type] === type;
        });
        const data = years.map(year =>
          // Fill missing year with null in the
          groupNameRaw.find(row => row[TOTAL.year] === year)
            ? groupNameRaw.find(row => row[TOTAL.year] === year).sum
            : null
        );
        series.push({
          name: groupName + " - " + type,
          data: data as number[],
          color: stringToColor(groupName),
          dashStyle: type === "Net Imports" ? "LongDash" : type === "Imports" ? "Solid" : "LongDashDotDot"
        });
      });
    });
    return {
      multiSelects,
      categories: years,
      series
    };
  },
  async types(_, __, { dataSources: { db } }): Promise<ImportExport["types"]> {
    return await db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.type)
      .orderBy(TOTAL.type)
      .pluck(TOTAL.type)
      .cache(15 * 60);
  }
};

export default importExport;
