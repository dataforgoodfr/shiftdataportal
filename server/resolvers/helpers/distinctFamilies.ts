import db from "../../db";
const distinctFamilies = async (tableName: string, columnName: string, source: string) => {
  const res = await db(tableName)
    .distinct(columnName)
    .where({ source })
    .whereNotNull(columnName)
    .orderBy(columnName, "asc");

  return (
    // Return a list of strings and not a list of objects
    res.map(family => family[columnName])
  );
};
export default distinctFamilies;
