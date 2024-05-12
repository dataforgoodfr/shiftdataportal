export const knexConfig = {
  client: "sqlite3",
  debug: false,
  useNullAsDefault: true,
  connection: {
    filename: './data.sqlite3'
  },
};
export default require("knex")(knexConfig);
