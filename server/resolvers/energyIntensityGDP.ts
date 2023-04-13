import { distinctCountries, distinctGroups, distinctZones } from "./helpers";
import energyMultiplier from "../utils/energyMultiplier";
import { EnergyIntensityGdpResolvers, EnergyUnit, EnergyIntensityGdp } from "../types";
import {
  ENERGY_INTENSITY_OF_GDP_energies_intensities_of_gdp_prod as TOTAL,
  COUNTRY_multiselect_groups_prod as MULTI_SELECT
} from "../dbSchema";
import energyUnits from "../utils/energyUnits";
import stringToColor from "../utils/stringToColor";
import groupBy from "../utils/groupBy";
import getMdInfos from "./helpers/getMdInfos";

const energyIntensityGdp: EnergyIntensityGdpResolvers = {
  async mdInfos(_, {}, { dataSources: { db } }): Promise<EnergyIntensityGdp["mdInfos"]> {
    // @TODO: Change to correct category name.
    return await getMdInfos(db.knex, "energy-intensity-gdp");
  },
  energyUnits(): EnergyIntensityGdp["energyUnits"] {
    return energyUnits;
  },
  async multiSelects(_, __, { dataSources: { db } }): Promise<EnergyIntensityGdp["multiSelects"]> {
    const res: EnergyIntensityGdp["multiSelects"] = [];

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
  async countries(_, __, { dataSources: { db } }): Promise<EnergyIntensityGdp["countries"]> {
    return await distinctCountries(TOTAL.__tableName, db.knex);
  },
  async groups(_, __, { dataSources: { db } }): Promise<EnergyIntensityGdp["groups"]> {
    return await distinctGroups(TOTAL.__tableName, db.knex);
  },
  async zones(_, __, { dataSources: { db } }): Promise<EnergyIntensityGdp["zones"]> {
    return await distinctZones(TOTAL.__tableName, db.knex);
  },
  async energyTypes(_, __, { dataSources: { db } }): Promise<EnergyIntensityGdp["energyTypes"]> {
    const res = await db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.energy_category)
      .cache(15 * 60);
    return res.map(({ energy_category }) => energy_category);
  },
  async gdpUnits(_, __, { dataSources: { db } }): Promise<EnergyIntensityGdp["gdpUnits"]> {
    const res = await db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.gdp_unit)
      .orderBy(TOTAL.gdp_unit, "asc")
      .cache(15 * 60);
    return (
      // Return a list of strings and not a list of objects
      res.map(({ gdp_unit }) => gdp_unit)
    );
  },
  async total(
    _,
    { energyUnit, groupNames, gdpUnit, yearStart, yearEnd, energyType },
    { dataSources: { db } }
  ): Promise<EnergyIntensityGdp["total"]> {
    const resRawQuery = db
      .knex(TOTAL.__tableName)
      .select(
        TOTAL.year,
        TOTAL.group_name,
        db.knex.raw("SUM(??)::numeric * ? as ??", [
          TOTAL.energy_intensity_of_gdp,
          energyUnit ? energyMultiplier(EnergyUnit.Mtoe, energyUnit) : 1,
          TOTAL.energy_intensity_of_gdp
        ])
      )
      .whereIn(TOTAL.group_name, groupNames)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .andWhere(TOTAL.gdp_unit, gdpUnit)
      .andWhere(TOTAL.energy_category, energyType)
      .groupBy(TOTAL.year, TOTAL.group_name)
      .orderBy(TOTAL.year)
      .cache(15 * 60);
    const yearsQuery = db
      .knex(TOTAL.__tableName)
      .distinct(TOTAL.year)
      .whereIn(TOTAL.group_name, groupNames)
      .andWhereBetween(TOTAL.year, [yearStart, yearEnd])
      .andWhere(TOTAL.gdp_unit, gdpUnit)
      .andWhere(TOTAL.energy_category, energyType)
      .orderBy(TOTAL.year)
      .pluck(TOTAL.year)
      .cache(15 * 60);

    // Get the multi-selects option
    const multiSelects = [];
    const maxYearSubQuery = db
      .knex(TOTAL.__tableName)
      .andWhere(TOTAL.energy_category, energyType)
      .max(TOTAL.year);
    const TotalTopCountriesDataQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name)
      .sum({ sum: TOTAL.energy_intensity_of_gdp })
      .where(TOTAL.group_type, "country")
      .andWhere(TOTAL.year, maxYearSubQuery)
      .andWhere(TOTAL.gdp_unit, gdpUnit)
      .andWhere(TOTAL.energy_category, energyType)
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "desc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);

    const TotalFlopCountriesDataQuery = db
      .knex(TOTAL.__tableName)
      .select(TOTAL.group_name)
      .sum({ sum: TOTAL.energy_intensity_of_gdp })
      .where(TOTAL.group_type, "country")
      .andWhere(TOTAL.year, maxYearSubQuery)
      .andWhere(TOTAL.gdp_unit, gdpUnit)
      .andWhere(TOTAL.energy_category, energyType)
      .groupBy(TOTAL.group_name)
      .orderBy("sum", "asc")
      .limit(10)
      .pluck(TOTAL.group_name)
      .cache(15 * 60);

    const [resRaw, years, TotalTopCountriesData, TotalFlopCountriesData] = await Promise.all([
      resRawQuery,
      yearsQuery,
      TotalTopCountriesDataQuery,
      TotalFlopCountriesDataQuery
    ]);
    console.log({ TotalTopCountriesData });
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
            ? groupNameRaw.find(row => row[TOTAL.year] === year)[TOTAL.energy_intensity_of_gdp]
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
export default energyIntensityGdp;
