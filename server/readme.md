# The Node JS Express GraphQL API of the data portal.

For installation prerequisites please check the readme of the main repo.
Almost everything is written in TypeScript.

# Why GraphQL?

GraphQL is the person solution to query multiple data at the same time from the same endpoint.
It's client first vision enables the client to receive predictable data.
Finally the developer experience is increase thanks to graphql-code-generator which enables us to type the resolvers but also the queries.
Warning: Each time you modify the schema (schema.ts) you'll have to run `yarn generate` while the server is running.

# Dependencies

**Runtime :** Node JS

**Database :** SQLite.

**Query Builder (not an ORM) :** Knex JS because it is the most maintainable library because it is readable and doesn't have too many layers of abstraction. Also we never modify the DB nor we do left joins so we needed only a light layer between the DB and the server.

**GraphQL framework :** Apollo Server.

**Hosting :** Scalingo.

# GraphQL code generator and PosgreSQL schema

**graphql-code-generator** is called with `yarn run generate:types`.
**graphql-code-generator** takes the schema and create Typescript types so that we can type all our resolvers. We know what arguments we will be receiving and what to return.

**Warning:** you'll have to run each command every time you change the schema or the database structure.
