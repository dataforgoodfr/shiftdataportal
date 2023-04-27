import { SQLDataSource } from "datasource-sql"

require("dotenv-flow").config();
import { ApolloServer as ApolloServerExpress } from "apollo-server-express";
import { ApolloServer as ApolloServerLambda } from "apollo-server-lambda";
import { Application } from "express";
import resolvers from "./resolvers";
import schema from "./schema";
import { knexConfig } from "./db";
import knex from "knex";


const express = require("express")

const db = new SQLDataSource(knexConfig);

export interface Context {
  dataSources: { db: { knex: knex; db: knex } };
}
if (process.env.NODE_ENV === "production") {
  /***************************************
   *  CREATE THE GRAPHQL SERVER (Apollo)
   ***************************************/
  const server = new ApolloServerLambda({
    typeDefs: schema,
    resolvers: resolvers as any,
    playground: true,
    introspection: false,
    tracing: false,
    dataSources: () => ({ db })
  });
  exports.graphqlHandler = server.createHandler({
    cors: {
      origin: "*",
      credentials: true
    }
  });
} else if (process.env.NODE_ENV === "development") {
  const app: Application = express();
  const path = "/";
  app.set("port", process.env.PORT || 4000);
  const server = new ApolloServerExpress({
    typeDefs: schema,
    resolvers: resolvers as any,
    playground: true,
    introspection: true,
    tracing: true,
    dataSources: () => ({ db })
    // plugins: [responseCachePlugin()],
    // cacheControl: {
    //   defaultMaxAge: 20
    // }
  });
  server.applyMiddleware({ app, path });
  app.listen(app.get("port"), () => {
    console.log(
      `🚀 Server ready at http://localhost:${app.get("port")}${server.graphqlPath} in ${app.get("env")} mode`
    );
    console.log("  Press CTRL-C to stop\n");
  });
} else {
  throw new Error("No environment detected");
}
