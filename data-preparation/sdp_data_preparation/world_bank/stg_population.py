import os

import pandas as pd
from sdp_data_preparation.countries_and_zones import CountryNameTranslator


def stage_population(data_filepath: str) -> pd.DataFrame:
    filepath = os.path.join(data_filepath, "raw_population.csv")
    population = pd.read_csv(filepath)
    df = _select_and_rename_columns(population)
    df = _translate_country(df)
    return df


def _select_and_rename_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = df[["date", "country.value", "value"]]
    df = df.rename(
        columns={
            "date": "year",
            "country.value": "country",
            "value": "population",
        }
    )
    return df.dropna()


def _translate_country(df: pd.DataFrame) -> pd.DataFrame:
    country_name_translator = CountryNameTranslator()
    df["country"] = country_name_translator.run(df["country"], raise_errors=False)
    df = df.dropna(axis=0, subset=["country"])
    return df[df["country"] != "Delete"]
