# The Shift Project Data Portal V2

This is the monorepo containing multiple stacks.
Each stack is explained in details in it's directory.
Those stacks are mostly made with Node JS, Typescript, Apollo GraphQL, AWS Lambda, React JS, Next JS

## Prerequisites

Install Node JS, Serverless, Typescript and Yarn

## Stacks

### /server

The Node JS Serverless GraphQL API of the data portal. It is connected to a RDS PosgreSQL DB.

### /client

The React JS web application, it is server side rendered (SSR) thanks to Next JS also in Serverless mode.

### /csv-generator

A Node JS Lambda function that receives an array of data and returns a CSV.

### /chart-screenshot

A Serverless Puppeteer (Chrome Headless) that receives the URL of the /client and takes a screenshot of the ".screenshot" DOM element.
