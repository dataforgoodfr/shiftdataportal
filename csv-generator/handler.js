require("dotenv-flow").config();
const createCsvStringifier = require("csv-writer").createObjectCsvStringifier;

module.exports.csv = async event =>
  new Promise(async (resolve, reject) => {
    try {
      // Decode if body is base64 encoded
      jsonBody = event.isBase64Encoded ? new Buffer(event.body, "base64").toString("ascii") : event.body;
      // Turn it into a js array of objects
      const parsedBody = JSON.parse(jsonBody);
      // Define the columns, the first one will be the type e.g the energy families
      const header = [{ id: "type", title: "" }, ...parsedBody[0].data.map(({ x }) => ({ id: x, title: x }))];
      const csvStringifier = createCsvStringifier({
        header
      });
      // Flatten the object so it looks something like this : {type: 'Oil', 1990: 35664, 1991: 36934...}
      const records = parsedBody.map(({ id, data }) => ({
        type: id,
        ...data.reduce((acc, { x, y }) => {
          acc[x] = y;
          return acc;
        }, {})
      }));

      // Resolve with the response file.
      resolve({
        statusCode: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="data.csv"`,
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
          "Access-Control-Allow-Methods": "POST"
        },
        // Concat the headers and the records into the response body
        body: csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records),
        isBase64Encoded: false
      });
    } catch (err) {
      reject(err);
    }
  });

module.exports.test = async event =>
  new Promise(async (resolve, reject) => {
    resolve({ statusCode: 200, body: "<h1>Test</h1>" });
  });
