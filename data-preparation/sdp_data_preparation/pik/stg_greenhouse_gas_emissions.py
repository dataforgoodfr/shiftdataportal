import os
import re
from enum import StrEnum

import pandas as pd

from sdp_data_preparation import utils
from sdp_data_preparation.countries_and_zones import CountryIsoCodeTranslator, CountryNameTranslator
from sdp_data_preparation.utils import StatisticsDataframeFormatter

GLOBAL_WARMING_POTENTIAL_CODE_REGEX = r"\((S?AR[456]?)GWP100\)"


class AssessmentReport(StrEnum):
    SECOND = "SAR"
    FOURTH = "AR4"
    FIFTH = "AR5"
    SIXTH = "AR6"


class Sector(StrEnum):
    AGRICULTURE = "Agriculture"
    ENERGY = "Energy"
    INDUSTRY_AND_CONSTRUCTION = "Industry and Construction"
    OTHERS = "Other Sectors"
    WASTE = "Waste"



def stage_greenhouse_gas_emissions(data_filepath: str) -> pd.DataFrame:
    filepath = os.path.join(data_filepath, "raw_greenhouse_gas_emissions_third_party.csv")
    df = pd.read_csv(filepath)
    df = _rename_columns(df)
    df = _filter_gases(df)
    df = _filter_sectors(df)
    df = _filter_countries(df)
    df = _add_global_warming_potential(df)
    df = _unpivot_years(df)
    # Why do we divide by 1000?
    df["greenhouse_gas_emission"] = df["greenhouse_gas_emission"] * df["global_warming_potential"] / 1_000
    df["unit"] = "MtCO2eq"
    return _aggregate_and_format(df)


def _rename_columns(df: pd.DataFrame) -> pd.DataFrame:
    df = utils.clean_column_names(df)
    return df.rename(
        columns={
            "area": "country_code",
            "category": "sector",
            "entity": "gas",
        }
    )


def _filter_gases(df: pd.DataFrame) -> pd.DataFrame:
    # The column 'used_global_warming_potential' represents the IPCC
    # Assessment Report from which the global warming potentials are
    # used.
    df["used_global_warming_potential"] = df["gas"].apply(_get_assessment_report_code)
    df["gas"] = df["gas"].apply(_remove_global_warming_potential_code)
    df["is_gas_aggregation"] = df["gas"].apply(_identify_gas_aggregation)
    return df[
        ~df["is_gas_aggregation"]
        & df["used_global_warming_potential"].isin([None, "AR6"])
    ]


def _get_assessment_report_code(original_gas_value: str) -> str:
    match = re.search(GLOBAL_WARMING_POTENTIAL_CODE_REGEX, original_gas_value)
    return match.group(1) if match else None


def _remove_global_warming_potential_code(original_gas_value: str) -> str:
    value = re.sub(GLOBAL_WARMING_POTENTIAL_CODE_REGEX, "", original_gas_value)
    return value.strip()


def _identify_gas_aggregation(cleaned_gas_value: str) -> bool:
    return True if cleaned_gas_value in ["FGASES", "KYOTOGHG"] else False


def _filter_sectors(df: pd.DataFrame) -> pd.DataFrame:
    df["sector"] = df["sector"].replace(
        {
            "1": Sector.ENERGY,
            "2": Sector.INDUSTRY_AND_CONSTRUCTION,
            "M.AG": Sector.AGRICULTURE,
            "4": Sector.WASTE,
            "5": Sector.OTHERS,
        }
    )
    return df[df["sector"].isin([sector.value for sector in Sector])]


def _filter_countries(df: pd.DataFrame) -> pd.DataFrame:
    country_code_mapper = CountryIsoCodeTranslator()
    df["country"] = country_code_mapper.run(df["country_code"], raise_errors=True)

    countries_to_be_removed = [
        "Alliance of Small Island States (AOSIS)",
        "Annex-I Parties to the Convention",
        "BASIC countries (Brazil, South Africa, India and China)",
        "European Union (28)",
        "Least Developed Countries",
        "Non-Annex-I Parties to the Convention",
        "Umbrella Group",
        "Umbrella Group (28)",
        "World",
    ]
    df = df[~df["country"].isin(countries_to_be_removed)]

    country_mapper = CountryNameTranslator()
    df["country"] = country_mapper.run(df["country"], raise_errors=False)
    df = df[df["country"] != "Delete"]
    return df.dropna(subset=["country"])


def _add_global_warming_potential(df: pd.DataFrame) -> pd.DataFrame:
    global_warming_potential_mapping = {
        "CO2": 1,
        "CH4": 28,
        "N2O": 273,
        "NF3": 17_400,
        "SF6": 25_200,
    }
    df["global_warming_potential"] = df["unit"].apply(
        lambda value: global_warming_potential_mapping[value[:3]]
    )
    return df


def _unpivot_years(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop(
        columns=[
            "provenance",
            "country_code",
            "used_global_warming_potential",
            "is_gas_aggregation",
        ]
    )
    return df.melt(
        id_vars=[
            "country",
            "sector",
            "gas",
            "global_warming_potential",
            "unit",
        ],
        var_name="year",
        value_name="greenhouse_gas_emission",
    )


def _aggregate_and_format(df: pd.DataFrame) -> pd.DataFrame:
    df = df.groupby(
        ["country", "sector", "gas", "year", "unit"]
    ).agg({"greenhouse_gas_emission": "sum"}).reset_index()

    formatter = StatisticsDataframeFormatter(
        df=df,
        col_statistics="greenhouse_gas_emission",
        round_statistics=5,
    )
    df = formatter.run()
    return df.reset_index(drop=True)
