# The Shift Project Data Portal

This repository contains all code used to [source](https://github.com/dataforgoodfr/shiftdataportal/tree/main/data-preparation) (python), [clean](https://github.com/dataforgoodfr/shiftdataportal/tree/main/data-preparation) (python), [prepare](https://github.com/dataforgoodfr/shiftdataportal/tree/main/data-preparation) (python), [serve](https://github.com/dataforgoodfr/shiftdataportal/tree/main/server) (NodeJS, Typescript, Express, GraphQL, SQLite) and [display data](https://github.com/dataforgoodfr/shiftdataportal/tree/main/client) (ReactJS, Typescript, NextJS, Apollo GraphQL) of [theshiftdataportal.org](https://theshiftdataportal.org/).


## Deployment

The Data Portal is hosted at Scalingo (French 🐓 cloud provider). Deployment is automated thanks to CircleCI: **merging a pull request to the `main` branch means pushing to production**. You can check the process in [circleci config file](https://github.com/dataforgoodfr/shiftdataportal/blob/main/.circleci/config.yml). To get access to CircleCI interface, connect with Github login.

During the deployment, files in [server/data](https://github.com/dataforgoodfr/shiftdataportal/tree/main/server/data) are [aggregated](https://github.com/dataforgoodfr/shiftdataportal/blob/a13a050c66e82251b37c8c4743962fd97e079c5d/server/csv-to-sqlite.ts) in a sqlite database which is embedded in production API.

## Side projects

These projects are not maintained and we are not sure if they can serve anymore.

### /csv-generator

A Node JS Lambda function that receives an array of data and returns a CSV.

### /chart-screenshot

A Serverless Puppeteer (Chrome Headless) that receives the URL of the /client and takes a screenshot of the ".screenshot" DOM element.
