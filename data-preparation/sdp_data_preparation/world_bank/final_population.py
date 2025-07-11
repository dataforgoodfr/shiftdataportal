import os

import pandas as pd

from sdp_data_preparation.countries_and_zones import StatisticsPerCountriesAndZonesProcessor
from sdp_data_preparation.utils import StatisticsDataframeFormatter


def process_final_population(project_root_path: str) -> pd.DataFrame:
    population_filepath = os.path.join(
        project_root_path,
        f"data/world_bank/stg_population.csv"
    )
    countries_and_zones_filepath = os.path.join(project_root_path, "data/countries/countries_and_zones.csv")
    population_by_country = pd.read_csv(population_filepath)
    countries_and_zones = pd.read_csv(countries_and_zones_filepath)

    processor = StatisticsPerCountriesAndZonesProcessor(
        df=population_by_country,
        countries_and_zones=countries_and_zones,
        group_by_colnames=['group_type', 'group_name', 'year'],
        aggregations={"population": "sum"},
    )
    population_by_country_and_zone = processor.run()

    formatter = StatisticsDataframeFormatter(
        df=population_by_country_and_zone,
        col_statistics="population",
    )
    df = formatter.run()

    # Uncomment the line below after merging PR 42
    # df["source"] = "World Bank"
    return df
