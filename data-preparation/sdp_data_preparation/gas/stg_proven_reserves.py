import pandas as pd

from sdp_data_preparation.countries_and_zones import StatisticsPerCountriesAndZonesProcessor
from sdp_data_preparation.utils import StatisticsDataframeFormatter


def stage_proven_reserves(
        proven_reserves_gas_filepath: str,
        countries_and_zones_filepath: str,
) -> pd.DataFrame:
    proven_reserves_by_country = pd.read_csv(proven_reserves_gas_filepath)
    countries_and_zones = pd.read_csv(countries_and_zones_filepath)

    processor = StatisticsPerCountriesAndZonesProcessor(
        df=proven_reserves_by_country,
        countries_and_zones=countries_and_zones,
        group_by_colnames=['group_type', 'group_name', 'year', 'energy_source', 'proven_reserves_unit'],
        aggregations={"proven_reserves": "sum"},
    )
    proven_reserves_by_country_and_zone = processor.run()

    formatter = StatisticsDataframeFormatter(
        df=proven_reserves_by_country_and_zone,
        col_statistics="proven_reserves",
    )
    return formatter.run()
