import fs from 'fs/promises'
import path from 'path'
import Database from 'better-sqlite3'
import Papa from 'papaparse'
import knex from 'knex'
import {chunk} from 'lodash'
import parserTypescript from "prettier/parser-typescript";
import prettier from "prettier/standalone";

const knexClient = knex({client: 'sqlite', useNullAsDefault: true});


const importFromFile = async (db: Database.Database, data: unknown [], tableName: string) => {
  await createTable(db, tableName, Object.keys(data[0]))

  for (const lines of chunk(data, 100)) {
    const sql = knexClient.insert(lines).into(tableName).toSQL().toNative()
    db.prepare(sql.sql).run(sql.bindings)
  }
}

const createTable = async(db: Database.Database, tableName: string, columns: string[]) => {
  const sql = knexClient.schema.createTable(tableName, table => {
      columns.forEach(c => {
          table.string(c)
      })
  }).toSQL()[0]

  return db.prepare(sql.sql).run(sql.bindings)
}

const getData = async (filePath: string) => {
  return new Promise<Array<unknown>>(async (resolve, reject) => {
    try {
      const file = await fs.readFile(filePath)

      Papa.parse(file.toString(), {
        header: true,
        complete:function(results) {
          resolve(results.data)
        }, error: (error) => reject(error)})
    } catch (error) {
      reject(error)
    }
  })
}


(async () => {
  try {
    await fs.rm('data.sqlite3')
  } catch (error) {

  }

  const tableSchemas: string[] = []

  const db = new Database('data.sqlite3')

  const files =await fs.readdir('data')

  for (const file of files) {
    console.log(file)

    const tableName = file.split('.')[0]
    const data = await getData(`data/${file}`)
    const columns = Object.keys(data[0])
    const schema: Record<string, string> = {}

    for (const column of columns) {
      schema[column] = column;
    }
    schema["__tableName"] = tableName;
    tableSchemas.push(`export const ${tableName} = ${JSON.stringify(schema)} `);

    await importFromFile(db, data, tableName)
  }

  const data = prettier.format(tableSchemas.join("\r\n\r\n"), {
    parser: "typescript",
    plugins: [parserTypescript]
  });

  fs.writeFile("./dbSchema.ts", data)
})()
