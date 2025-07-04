import os

import pandas as pd

from .common import prepare_stg_dataset_for_prod
from sdp_data_preparation.countries_and_zones import StatisticsPerCountriesAndZonesProcessor
from sdp_data_preparation.utils import StatisticsDataframeFormatter


def process_final_greenhouse_gas_emissions_by_sector(project_root_path: str) -> pd.DataFrame:
    ghg_emissions_filepath = os.path.join(
        project_root_path,
        f"data/pik/stg_greenhouse_gas_emissions.csv"
    )
    countries_and_zones_filepath = os.path.join(project_root_path, "data/countries/countries_and_zones.csv")
    ghg_emissions_by_country = pd.read_csv(ghg_emissions_filepath)
    ghg_emissions_by_country = prepare_stg_dataset_for_prod(ghg_emissions_by_country, is_gas_dataset=False)
    countries_and_zones = pd.read_csv(countries_and_zones_filepath)

    processor = StatisticsPerCountriesAndZonesProcessor(
        df=ghg_emissions_by_country,
        countries_and_zones=countries_and_zones,
        group_by_colnames=['group_type', 'group_name', 'year', 'sector', 'ghg_unit'],
        aggregations={"ghg": "sum"},
    )
    ghg_emissions_by_country_and_zone = processor.run()

    formatter = StatisticsDataframeFormatter(
        df=ghg_emissions_by_country_and_zone,
        col_statistics="ghg",
    )
    df = formatter.run()

    df["source"] = "PIK"
    return df[
        (df["ghg"] != 0)
        & (df["group_name"] != "Antarctica")
    ]
