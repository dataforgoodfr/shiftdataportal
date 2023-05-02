import { distinctCountries, distinctGroups, distinctZones } from "./helpers";

import { KayaResolvers, KayaDimensions, Kaya } from "../types";
import { KAYA_kaya_base_100_prod as TOTAL } from "../dbSchema";
import stringToColor from "../utils/stringToColor";
import getMdInfos from "./helpers/getMdInfos";

const kaya: KayaResolvers = {
  async mdInfos(_, __, { dataSources: { db } }): Promise<Kaya["mdInfos"]> {
    return await getMdInfos(db.knex, "kaya");
  },
  async countries(_, __, { dataSources: { db } }): Promise<Kaya["countries"]> {
    return await distinctCountries(TOTAL.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<Kaya["groups"]> {
    return await distinctGroups(TOTAL.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<Kaya["zones"]> {
    return await distinctZones(TOTAL.__tableName, db.knex);
  },
  dimensions(): Kaya["dimensions"] {
    return Object.values(KayaDimensions);
  },
  async total(_, { groupName }, { dataSources: { db } }): Promise<Kaya["total"]> {
    const factors = [
      TOTAL.co2_per_energy_b100,
      TOTAL.energy_per_gdp_b100,
      TOTAL.gdp_per_capita_b100,
      TOTAL.population_b100,
      TOTAL.co2_b100,
    ];
    const resRawQuery = db
      .knex(TOTAL.__tableName)
      .select(
        TOTAL.year,
        TOTAL.group_name,
        TOTAL.co2_per_energy_b100,
        TOTAL.energy_per_gdp_b100,
        TOTAL.gdp_per_capita_b100,
        TOTAL.population_b100,
        TOTAL.co2_b100
      )
      .where(TOTAL.group_name, groupName)
      .whereNotNull(TOTAL.group_name)
      .groupBy(
        TOTAL.year,
        TOTAL.group_name,
        TOTAL.co2_per_energy_b100,
        TOTAL.energy_per_gdp_b100,
        TOTAL.gdp_per_capita_b100,
        TOTAL.co2_b100,
        TOTAL.population_b100
      )
      .orderBy(TOTAL.year)
      .cache(15 * 60);
    const yearsQuery = db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.year)
      .where(TOTAL.group_name, groupName)
      .orderBy(TOTAL.year)
      .pluck(TOTAL.year)
      .cache(15 * 60);
    const [resRaw, years] = await Promise.all([resRawQuery, yearsQuery]);
    const series = [];
    factors.map((factor) => {
      const data = years.map((year) =>
        // Fill missing year with null in the
        resRaw.find((row) => row[TOTAL.year] === year)
          ? resRaw.find((row) => row[TOTAL.year] === year)[TOTAL[factor]]
          : null
      );
      let name;
      switch (factor) {
        case TOTAL.co2_per_energy_b100:
          name = "CO<sub>2</sub> per energy";
          break;
        case TOTAL.energy_per_gdp_b100:
          name = "Energy per GDP";
          break;
        case TOTAL.gdp_per_capita_b100:
          name = "GDP per capita";
          break;
        case TOTAL.population_b100:
          name = "Population";
          break;
        case TOTAL.co2_b100:
          name = "CO<sub>2</sub>";
          break;
        default:
          console.error(`Kaya factor name ${factor} didn't match any known factors`);
          name = "Population";
      }
      series.push({
        name,
        data: data as number[],
        color: stringToColor(name),
      });
    });
    return {
      categories: years,
      series,
    };
  },
};

export default kaya;
