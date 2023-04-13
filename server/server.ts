require("dotenv-flow").config();
import { ApolloServer as ApolloServerExpress } from "apollo-server-express";
import { ApolloServer as ApolloServerLambda } from "apollo-server-lambda";
import bodyParser from "body-parser";
import express, { Application } from "express";
// import responseCachePlugin from "apollo-server-plugin-response-cache";
import resolvers from "./resolvers";
import schema from "./schema";
import { knexConfig } from "./db";
import knexDatasource from "./knexDatasource";
import knex from "knex";

// @ts-ignore
const db = new knexDatasource(knexConfig);

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
    // plugins: [responseCachePlugin()],
    // cacheControl: {
    //   defaultMaxAge: 20
    // }
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
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
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
