import os

import pandas as pd

from sdp_data_preparation.countries_and_zones import StatisticsPerCountriesAndZonesProcessor
from sdp_data_preparation.utils import StatisticsDataframeFormatter


def stage_yearly_proven_reserves(project_root_path: str) -> pd.DataFrame:
    yearly_proven_reserves_gas = _get_yearly_proven_reserves(project_root_path=project_root_path, fossil_fuel="gas")
    yearly_proven_reserves_oil = _get_yearly_proven_reserves(project_root_path=project_root_path, fossil_fuel="oil")
    yearly_proven_reserves = pd.concat([yearly_proven_reserves_gas, yearly_proven_reserves_oil], axis=0)

    formatter = StatisticsDataframeFormatter(
        df=yearly_proven_reserves,
        col_statistics="proven_reserves",
    )
    return formatter.run()


def _get_yearly_proven_reserves(project_root_path: str, fossil_fuel: str) -> pd.DataFrame:
    if fossil_fuel == "coal":
        raise ValueError(
            "We don't manage the proven reserves of coal at the moment. Please provide either 'gas' or 'oil'."
        )

    if fossil_fuel not in ["gas", "oil"]:
        raise ValueError(
            f"'{fossil_fuel}' is not an expected value for fossil fuel. Please provide either 'gas' or 'oil'."
        )

    proven_reserves_filepath = os.path.join(
        project_root_path,
        f"data/opec/stg_yearly_proven_reserves_{fossil_fuel}.csv"
    )
    countries_and_zones_filepath = os.path.join(project_root_path, "data/countries/countries_and_zones.csv")
    proven_reserves_by_country = pd.read_csv(proven_reserves_filepath)
    countries_and_zones = pd.read_csv(countries_and_zones_filepath)

    processor = StatisticsPerCountriesAndZonesProcessor(
        df=proven_reserves_by_country,
        countries_and_zones=countries_and_zones,
        group_by_colnames=['group_type', 'group_name', 'year', 'energy_source', 'proven_reserves_unit'],
        aggregations={"proven_reserves": "sum"},
    )
    return processor.run()
