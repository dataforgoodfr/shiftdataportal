import pandas as pd
# TODO - à revoir
"""
-> Revue des valeurs manquantes "zone supprimées" pour PopulationCleaner.
"""


class StatisticsPerCapitaJoiner:

    @staticmethod
    def join_inner(df_statistics: pd.DataFrame, df_population_per_zone_and_countries: pd.DataFrame):
        """
        Computes statistics per capita by joinining on the population dataframe
        :param df_statistics: (dataframe) containing statistics and columns ["group_type", "group_name", "year"]
        :param df_population_per_zone_and_countries: (dataframe) containing population and columns ["group_type", "group_name", "year"]
        :return:
        """
        df_stats_per_capita = df_statistics.merge(df_population_per_zone_and_countries, how="inner",
                                                                   left_on=["group_type", "group_name", "year"],
                                                                   right_on=["group_type", "group_name", "year"])
        return df_stats_per_capita

    def run_historical_emissions_per_capita(self, df_historical_co2, df_population):
        df_stats_per_capita = self.join_inner(df_historical_co2, df_population)
        df_stats_per_capita["co2_per_capita"] = df_stats_per_capita["co2"] / df_stats_per_capita["population"]
        return df_stats_per_capita

    def run_footprint_vs_territorial_per_capita(self, df_footprint_vs_territorial, df_population):
        df_stats_per_capita = self.join_inner(df_footprint_vs_territorial, df_population)
        df_stats_per_capita["co2_per_capita"] = df_stats_per_capita["co2"] / df_stats_per_capita["population"]
        df_stats_per_capita["co2_per_capita_unit"] = "MtCO2 per capita"
        return df_stats_per_capita

    def run_ghg_per_capita(self, df_ghg_by_sector, df_population):
        df_ghg_by_sector = df_ghg_by_sector.groupby(["source", "group_type", "group_name", "year"]).agg(ghg=('ghg', 'sum'), ghg_unit=("ghg_unit", "first"))
        df_ghg_by_sector = df_ghg_by_sector.reset_index()
        df_ghg_per_capita = self.join_inner(df_ghg_by_sector, df_population)
        df_ghg_per_capita["ghg_per_capita"] = df_ghg_per_capita["ghg"] / df_ghg_per_capita["population"]
        return df_ghg_per_capita

    def run_final_energy_consumption_per_capita(self, df_final_energy_consumption, df_population):
        df_statistics_per_capita = self.join_inner(df_final_energy_consumption, df_population)
        df_statistics_per_capita["final_energy_per_capita"] = df_statistics_per_capita["final_energy"] / df_statistics_per_capita["population"]
        return df_statistics_per_capita

    def run_energy_per_capita(self, df_final_energy_consumption, df_population):
        df_statistics_per_capita = self.join_inner(df_final_energy_consumption, df_population)
        df_statistics_per_capita["energy_per_capita"] = df_statistics_per_capita["energy"] / df_statistics_per_capita["population"]
        return df_statistics_per_capita


