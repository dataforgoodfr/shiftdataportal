require("dotenv-flow").config();
import pgStructure, { Entity } from "pg-structure";
import parserTypescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";
const fs = require("fs");
pgStructure(
  {
    connectionString: process.env.SCALINGO_POSTGRESQL_URL
  },
  { includeSchemas: ["public"] }
)
  .then(db => {
    const tables = db.schemas.get("public").tables; // Map of Table objects.
    const res = [];
    // List of table names
    for (let table of tables.values()) {
      const columnNames = {};
      for (let column of (db.get("public." + table.name) as Entity).columns.values()) {
        columnNames[column.name] = column.name;
      }
      columnNames["__tableName"] = table.name;
      res.push(`export const ${table.name} = ${JSON.stringify(columnNames)} `);
    }
    return prettier.format(res.join("\r\n\r\n"), {
      parser: "typescript",
      plugins: [parserTypescript]
    });
  })
  .then(res => {
    fs.writeFile("./dbSchema.ts", res, function(err) {
      if (err) {
        return console.error(err);
      }
    });
  })
  .catch(err => console.error(err.stack));
