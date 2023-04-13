import db from "../../db";
const distinctSources = async (tableName: string) => {
  const res = await db(tableName)
    .distinct("source")
    .orderBy("source", "asc")
    .whereNotNull("source");
  return (
    // Return a list of strings and not a list of objects
    res.map(({ source }) => source)
  );
};
export default distinctSources;
