import stringToColor from "../../utils/stringToColor";
import { NameColor } from "../../types";
import knex from "knex";
const distinctGroups = async (tableName: string, knex: knex): Promise<NameColor[]> => {
  const res = await knex(tableName)
    .distinct("group_name")
    .where({ group_type: "group" })
    .whereNotNull("group_name")
    .orderBy("group_name", "asc")
    .groupBy("group_name")
    .pluck("group_name")
    .cache(15 * 60);
  return res.map((groupName) => ({ name: groupName, color: stringToColor(groupName) }));
};
export default distinctGroups;
