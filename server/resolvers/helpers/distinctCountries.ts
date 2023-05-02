import stringToColor from "../../utils/stringToColor";
import { NameColor } from "../../types";
import knex from "knex";
const distinctCountries = async (tableName: string, knex: knex): Promise<NameColor[]> => {
  const res = await knex(tableName)
    .distinct("group_name")
    .where({ group_type: "country" })
    .whereNotNull("group_name")
    .orderBy("group_name", "asc")
    .cache(15 * 60);
  return res.map((groupName) => ({ name: groupName.group_name, color: stringToColor(groupName.group_name) }));
};
export default distinctCountries;
