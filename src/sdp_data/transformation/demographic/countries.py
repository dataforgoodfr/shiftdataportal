import pandas as pd


class StatisticsPerCountriesAndZonesJoiner:

    @staticmethod
    def check_missing_countries_for_zone_aggregation(df_statistics, df_country):
        """
        Check if there are missing countries in the statistics dataset.
        """
        # check countries that are missing
        list_countries_statistics = df_statistics["country"].unique()
        df_countries_missing = df_country[~df_country["country"].isin(list_countries_statistics)]
        dict_countries_missing_per_zones = df_countries_missing.groupby("group_name")["country"].apply(list).to_dict()
        for group_name, list_countries_in_zone in sorted(dict_countries_missing_per_zones.items()):
            if len(list_countries_in_zone) > 0:
                print(f"\nWARNING: {len(list_countries_in_zone)} countries are missing in the statistics dataset for zone : {group_name}")
                print(list_countries_in_zone)

    @staticmethod
    def check_countries_not_matching(df_statistics, df_country):
        """
        Check countries that are in the statistics dataset but not in the coutrnies referential.
        """
        # check countries that are missing
        set_countries_not_matching = set(df_statistics["country"].unique()).difference(set(df_country["country"].unique()))
        if len(set_countries_not_matching) > 0:
            print("\nWARNING: %s countries are in the statistics dataset but not in the countries referential" % len(set_countries_not_matching))
            print("Please check the following list:")
            print(set_countries_not_matching)
        

    def run(self, df_statistics, df_country, list_cols_group_by, dict_aggregation):
        """
        Joins df_statistics with df_country on country column.
        """
        # check countries that are missing
        self.check_missing_countries_for_zone_aggregation(df_statistics, df_country)
        self.check_countries_not_matching(df_statistics, df_country)

        # compute stastics per zone
        df_stats_per_zone = (pd.merge(df_country, df_statistics, how='left', left_on='country', right_on='country')
                                    .groupby(list_cols_group_by)
                                    .agg(dict_aggregation)
                                    .reset_index()
                             )

        # add stastics for each countries
        df_stats_per_countries = df_statistics.copy()
        df_stats_per_countries = df_stats_per_countries.rename({"country": "group_name"}, axis=1)
        df_stats_per_countries["group_type"] = "country"

        # concatenate countries and zones
        df_stats_per_zone_and_countries = pd.concat([df_stats_per_zone, df_stats_per_countries], axis=0)

        return df_stats_per_zone_and_countries
