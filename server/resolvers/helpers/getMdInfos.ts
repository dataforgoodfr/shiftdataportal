import { DATAPORTAL_UTILS_dataportal_sources_prod as UTILS } from "../../dbSchema";
export default async (knex, category: string) => {
  const resRaw = await knex(UTILS.__tableName)
    .select(UTILS.body)
    .where(UTILS.category, category)
    .pluck(UTILS.body)
    .cache(15 * 60);
  return resRaw[0] ? resRaw[0] : "";
};
