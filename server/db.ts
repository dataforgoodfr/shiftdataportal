console.log(JSON.stringify(process.env))
console.log(`>>> ${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`)
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
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
};
export default require("knex")(knexConfig);
