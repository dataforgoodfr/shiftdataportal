
# data-preparation

## Sources

- **WB**: World Bank Group
- **IEA**: International Energy Agency
- **EIA**: U.S. Energy Information Administration
- **BP**: BP Group
- **EMBER**: Ember-Climate.Org
- **OWID**: Our World In Data (TODO)

## Code organisation

### /src/sdp_data/main.py

Main module<br>
Just RUN IT AS IS to loop over all "Raw" sources (BP, EIA, EMBER, IEA, WB), save them to csv files and pack/zip them into /data/\_raw.7z

### /src/sdp_data/raw.py

Define default behaviour of the two main base classes Api(Raw) and File(Raw)

### /src/sdp_data/sources/

Folder listing the "Raw Data" sources modules.<br>
Each raw_{source}.py define configuration/implementation of the Api and/or File class(es) for a specific "Raw Data" {source} (ie: raw_wb.py for World Bank "Raw Data" source)

## Transformation

Once that the raw data has been downloaded, it can be transformed into clean data using `data-preparation/src/main_transformation.py`.
When you run the main_transforamion.py file, data will be stored in 3 different directories : 

*data-preparation/data/raw_data* : this is where you have to store the raw data you have collected or downloaded from the internet.
This directory will contain recent up-to-data data. 

-> For example, to refresh the PIK source dataset, you have to download file Guetschow_et_al_2023b-PRIMAP-hist_v2.5_final_15-Oct-2023.csv
and place it into the raw_data/ghg directory. See notion for more information on raw data sources.

*data-preparation/data/new_prod_data* : it is containing the resulting dataset that you have obtained when running
`data-preparation/src/main_transformation.py`. All the resulting datasets will be placed here.  See notion for more information.

*data-preparation/data/current_prod_data* : it is containing processed old data that have been processed with Dataiku (legacy code).
This directory can contain old processed data that can be used to track changes compared to old datasets or to use some
sources that are no longer available today. See notion for more information.

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
