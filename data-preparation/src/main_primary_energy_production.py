############################
###### Initialisation ######
############################

import pandas as pd
import numpy as np
import re
from utils.utils import CountryTranslatorFrenchToEnglish
from transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
import os


PROD_RELATIVE_PATH = "../../data/raw/primary_energy/production"
BASE_PROD_RELATIVE_PATH = (
    "../../data/raw/primary_energy/primary_energy_etemad_and_luciani.csv"
)
GOAL_RELATIVE_PATH = "../../server/data/WORLD_ENERGY_HISTORY_primary_energy_prod.csv"
ENERGY_SOURCES = [
    "Oil",
    "Gas",
    "Coal",
    "Nuclear",
    "Solar, Tide, Wave, Fuel Cell",
    "Biomass and Waste",
    "Geothermal",
    "Wind",
    "Hydroelectricity",
    "Fuel Ethanol",
    "Biodiesel",
]
ENERGY_SOURCES.sort()


# Conversion rates
RATE_QUAD_TO_MTOE = 25.2
RATE_MBD_TO_MTOE = 51.1


def find_csv_filenames(path_to_dir: str) -> list:
    """
    Récupère la liste des csvs d'un dossier.
    """

    suffix = ".csv"
    filenames = os.listdir(path_to_dir)
    return [
        os.path.join(path_to_dir, filename)
        for filename in filenames
        if filename.endswith(suffix)
    ]


def transform_new_data(data: pd.DataFrame, energy_family: str):
    """
    Transfome les nouvelles données; ajoute les colomnes energy_family et energy_unit, enlève les colomnes inutiles.

    """

    #### get the unit for the energy_family
    data = data.rename(columns={"Unnamed: 1":"country"})
    energy = data["country"].iloc[0]
    unit = (
        re.search(r"\((.*?)\)", energy).group(1)
        if re.search(r"\((.*?)\)", energy)
        else ""
    )
    if energy_family == "Gas":
        print(unit)
    #### setting the energy_family and unit columns
    data["energy_family"] = energy_family
    data["energy_unit"] = "Mtoe" if unit == "MMTOE" else unit

    ### setting the country column
    data["country"] = np.where(
        data["country"].str.contains(unit), np.NaN, data["country"]
    )
    data.country = data.country.str.lstrip()
    data = data.drop(index=data.index[0])
    data = data.drop(columns=["API"])
    return data


def rearrange_data(data: pd.DataFrame):
    """
    Effectue le pivot des données (de colomnes années à colomne energy)

    """
    data = data.melt(
        id_vars=["energy_family", "country", "energy_unit"],
        var_name="year",
        value_name="energy",
    )
    data["year"] = data["year"].apply(int)
    return data


if __name__ == "__main__":
    translator = CountryTranslatorFrenchToEnglish()
    stats = StatisticsPerCountriesAndZonesJoiner()

    current_dir = os.path.dirname(os.path.realpath(__file__))

    base_data_path = os.path.join(current_dir, BASE_PROD_RELATIVE_PATH)
    prod_path = os.path.join(current_dir, PROD_RELATIVE_PATH)
    goal_path = os.path.join(current_dir, GOAL_RELATIVE_PATH)

    path_countries = os.path.join(
        current_dir, "../../data/raw/demographics/country_groups.csv"
    )

    df_country = pd.read_csv(path_countries)

    csv_list = find_csv_filenames(prod_path)
    csv_list.sort()

    production_data_list = []
    for csv, energy_family in zip(csv_list, ENERGY_SOURCES):
        df = pd.read_csv(csv, skiprows=1)
        df = transform_new_data(df, energy_family=energy_family)
        df = rearrange_data(df)
        production_data_list.append(df)

    production_eia = pd.concat(production_data_list, ignore_index=True)

    production_eia.energy = pd.to_numeric(production_eia.energy, errors="coerce")
    available_production_eia = production_eia.dropna()
    available_production_eia.country = translator.run(
        available_production_eia.country, raise_errors=False
    )

    ### Conversions
    available_production_eia.loc[
        available_production_eia.energy_unit == "Mb/d", ["energy"]
    ] = (
        available_production_eia.loc[
            available_production_eia.energy_unit == "Mb/d", ["energy"]
        ]
        * RATE_MBD_TO_MTOE
    )
    available_production_eia.loc[
        available_production_eia.energy_unit == "quad Btu", ["energy"]
    ] = (
        available_production_eia.loc[
            available_production_eia.energy_unit == "quad Btu", ["energy"]
        ]
        * RATE_QUAD_TO_MTOE
    )

    available_production_eia.energy_unit = available_production_eia.energy_unit.fillna(
        "Mtoe"
    )

    list_col_group_by = ["group_type", "group_name", "energy_family", "year"]
    dict_agg = {"energy": "sum"}
    available_production_eia = stats.run(
        available_production_eia,
        df_country=df_country,
        list_cols_group_by=list_col_group_by,
        dict_aggregation=dict_agg,
    )

    available_production_eia["type"] = "Production"
    available_production_eia["source"] = "eia"
    available_production_eia.loc[:, ["energy_unit"]] = "Mtoe"

    ### Getting the data from 1980 until 2016 from the actual portal
    primary_energy_until_2016 = pd.read_csv(base_data_path)
    production_until_2016 = primary_energy_until_2016[
        primary_energy_until_2016.type == "Production"
    ].copy()
    compared = primary_energy_until_2016.merge(
        available_production_eia,
        on=["energy_family", "year", "group_type", "group_name", "energy_unit", "type"],
        suffixes=("_base", "_new"),
        how="outer",
    )
    compared["energy"] = compared["energy_new"].fillna(compared["energy_base"])
    compared["source"] = np.where(
        compared.energy_new.isna(), compared["source_base"], compared["source_new"]
    )
    compared = compared.drop(
        columns=["source_new", "source_base", "energy_new", "energy_base"]
    )
    
    compared.to_csv(goal_path,index=False)

# not in previous data : Palau , andorra , Monaco, San Marino, Liechstenstein, Palestine
