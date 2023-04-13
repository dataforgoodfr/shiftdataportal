import Knex, { QueryBuilder } from "knex";
// declare module "express" {
//   export interface Request {}
// }

declare module "knex" {
  interface QueryInterface<TRecord extends {} = any, TResult = any> {
    cache(ttl: number): QueryBuilder<TRecord, TResult>;
  }
}
