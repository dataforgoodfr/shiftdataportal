import os

import pandas as pd

from sdp_data_preparation.countries_and_zones import CountryNameTranslator


def stage_yearly_population(data_filepath: str, end_year: int = 2024) -> pd.DataFrame:
    filepath = os.path.join(data_filepath, "raw_yearly_population.csv")
    yearly_population = pd.read_csv(filepath)
    df = _clean_columns_and_rows(yearly_population)
    df = _unstack_to_series(df)
    df = _filter_out_projection_years(df, last_estimation_year=end_year)
    df = _translate_country(df)
    return df


def _clean_columns_and_rows(df: pd.DataFrame) -> pd.DataFrame:
    zone_names_to_be_dropped = [
        "africa",
        "americas",
        "asia",
        "europe",
        "Regions",
        "world",
    ]
    df = df.set_index("name").drop("geo", axis=1)
    df = df.loc[~df.index.isin(zone_names_to_be_dropped)]
    return df


def _unstack_to_series(df: pd.DataFrame) -> pd.DataFrame:
    df = df.unstack().reset_index()
    df.columns = ["year", "country", "population"]
    return df


def _filter_out_projection_years(df: pd.DataFrame, last_estimation_year: int) -> pd.DataFrame:
    df["year"] = pd.to_numeric(df["year"]).astype(int)
    df = df[(df["year"] <= last_estimation_year) & (df['year'].notnull())]
    return df


def _translate_country(df: pd.DataFrame) -> pd.DataFrame:
    country_name_translator = CountryNameTranslator()
    df["country"] = country_name_translator.run(df["country"], raise_errors=False)
    return df
