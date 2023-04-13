// const { SQLDataSource } = require("datasource-sql");
import { SQLDataSource } from "datasource-sql";

// const MINUTE = 60;

class knexDatasource extends SQLDataSource {
  // getFruits() {
  //   return this.knex
  //     .select("*")
  //     .from("fruit")
  //     .where({ id: 1 })
  //     .cache(MINUTE);
  // }
}

export default knexDatasource;
