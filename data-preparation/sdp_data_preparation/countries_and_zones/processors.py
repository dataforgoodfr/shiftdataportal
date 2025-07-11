from typing import Union, List, Dict

import pandas as pd


class StatisticsPerCountriesAndZonesProcessor:

    def __init__(
            self,
            df: pd.DataFrame,
            countries_and_zones: pd.DataFrame,
            group_by_colnames: Union[str, List[str]],
            aggregations: Dict[str, str],
    ) -> None:
        if isinstance(group_by_colnames, str):
            group_by_colnames = [group_by_colnames]

        self.df = df
        self.countries_and_zones = countries_and_zones
        self.group_by_colnames = group_by_colnames
        self.aggregations = aggregations

    def check_missing_countries(self) -> None:
        """
        Checks if there are missing countries in the statistics dataset.
        """
        countries_from_df = self.df["country"].unique()
        missing_countries_df = self.countries_and_zones[~self.countries_and_zones["country"].isin(countries_from_df)]
        missing_countries_per_zone_dict = missing_countries_df.groupby("group_name")["country"].apply(list).to_dict()

        # Print warnings
        for zone_name, list_countries_in_zone in sorted(missing_countries_per_zone_dict.items()):
            if len(list_countries_in_zone) > 0:
                print(
                    f"WARNING: {len(list_countries_in_zone)} countries are missing in the "
                    f"statistics dataset for zone : {zone_name}"
                )
                print(list_countries_in_zone)

    def check_unmatched_countries(self) -> None:
        """
        Check countries that are in the statistics dataset but not in the countries reference frame.
        """
        countries_from_df = set(self.df["country"].unique())
        countries_from_reference_frame = set(self.countries_and_zones["country"].unique())
        unmatched_countries = countries_from_df.difference(countries_from_reference_frame)

        # Print warnings
        if len(unmatched_countries) > 0:
            print(
                f"WARNING: {len(unmatched_countries)} countries are in the statistics dataset but not in "
                f"the countries reference frame."
            )
            print("Please check the following list:")
            print(unmatched_countries)

    def run(self) -> pd.DataFrame:
        # Check countries that are missing
        self.check_missing_countries()
        self.check_unmatched_countries()

        # Compute statistics per zone
        df_stats_per_zone = (
            pd.merge(self.countries_and_zones, self.df, how='left', left_on='country', right_on='country')
            .groupby(self.group_by_colnames)
            .agg(self.aggregations)
            .reset_index()
        )

        # Add statistics for each country
        df_stats_per_countries = self.df.copy()
        df_stats_per_countries = df_stats_per_countries.rename({"country": "group_name"}, axis=1)
        df_stats_per_countries["group_type"] = "country"

        # Concatenate statistics per country and per zone
        return pd.concat([df_stats_per_zone, df_stats_per_countries], axis=0)
