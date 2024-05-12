# The Shift Project Data Portal

This is the monorepo containing multiple stacks.
Each stack is explained in details in it's directory.
Those stacks are mostly made with Node JS, Typescript, Apollo GraphQL, React JS, Next JS

## Prerequisites

Install Node JS 20 and Yarn

## Stacks

### /server

The Node JS GraphQL API of the data portal. It is connected to a SQLite DB.

### /client

The React JS web application, it is server side rendered (SSR) thanks to Next JS.

### /csv-generator

A Node JS Lambda function that receives an array of data and returns a CSV.

### /chart-screenshot

A Serverless Puppeteer (Chrome Headless) that receives the URL of the /client and takes a screenshot of the ".screenshot" DOM element.

### /data

This project aims at retrieving "raw" datasets for the Shift Data Portal (The Shift Project).

"Raw data" sources/organisations:
- **WB**: World Bank Group
- **IEA**: International Energy Agency
- **EIA**: U.S. Energy Information Administration
- **BP**: BP Group
- **EMBER**: Ember-Climate.Org
- **OWID**: Our World In Data (TODO)

#### Code:
##### /src/sdp_data/main.py
Main module<br>
Just RUN IT AS IS to loop over all "Raw" sources (BP, EIA, EMBER, IEA, WB), save them to csv files and pack/zip them into /data/\_raw.7z

#### /src/sdp_data/raw.py
Define default behaviour of the two main base classes Api(Raw) and File(Raw)

#### /src/sdp_data/sources/
Folder listing the "Raw Data" sources modules.<br>
Each raw_{source}.py define configuration/implementation of the Api and/or File class(es) for a specific "Raw Data" {source} (ie: raw_wb.py for World Bank "Raw Data" source)

## Contributing

We use Python 3.9, ensure you have this version on your computer. If you already have another version, you can manage several versions of Python with [pyenv](https://github.com/pyenv/pyenv) for Linux/MacOS or [pyenv-win](https://github.com/pyenv-win/pyenv-win) for Windows.

You can create the virtual environment and activate it.

- On Linux/MacOS

```
python3 -m venv venv
source venv/bin/activate
```

- On Windows

```
python -m venv venv
.\venv\Scripts\activate
```

If you use *pyenv* or *pyenv-win*, you can run this command to set the python version: `pyenv local 3.9.X`.

And finally you can install all the packages needed, first *pip*, then the external packages and the local ones.

```
pip install -U pip
pip install -r requirements.txt
pip install -e .
```

After this, you should be ready to contribute!
