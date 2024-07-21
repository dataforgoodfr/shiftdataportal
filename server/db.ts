export const knexConfig = {
  client: "pg",
  pool: {
    min: 0,
    max: 50,
  },
  migrations: {
    tableName: "migrations",
  },
  debug: false,
  connection: process.env.SCALINGO_POSTGRESQL_URL,
};
export default require("knex")(knexConfig);
