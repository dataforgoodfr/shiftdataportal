import knex from "knex";
export const knexConfig = {
  client: "pg",
  pool: {
    min: 0,
    max: 50
  },
  migrations: {
    tableName: "migrations"
  },
  debug: false,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
};
export default knex(knexConfig);
