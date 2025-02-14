from transformation.demographic.population import GapMinderPerZoneAndCountryProcessor, PopulationPerZoneAndCountryProcessor
from transformation.demographic.worldbank_scrap import WorldBankScrapper
from utils.format import StatisticsDataframeFormatter
import os
import pandas as pd


if __name__ == "__main__":

    # Read Country data
    current_dir = os.getcwd()
    path_countries = os.path.join(current_dir, "../../data/raw/demographics/country_groups.csv")
    df_country = pd.read_csv(path_countries)

    # Update Worldbank Population
    df_population_raw = WorldBankScrapper().run("population")
    df_population_worldbank = PopulationPerZoneAndCountryProcessor().run(df_population_raw, df_country)
    df_population_worldbank = StatisticsDataframeFormatter().select_and_sort_values(df_population_worldbank, "population")
    df_population_worldbank.to_csv(f"../../data/processed/demographics/DEMOGRAPHIC_POPULATION_WORLDBANK_prod.csv", index=False)

    # update Gapminder Population
    df_population_gapmidner_raw = pd.read_excel(f"../../data/raw/demographics/GM-Population - Dataset - v8.xlsx",
                                                sheet_name="data-pop-gmv8-in-columns")

    df_gapminder = GapMinderPerZoneAndCountryProcessor().run(df_population_gapmidner_raw, df_country)
    df_gapminder = StatisticsDataframeFormatter().select_and_sort_values(df_gapminder, "population")
    df_gapminder.to_csv(f"../../data/processed/demographics/DEMOGRAPHIC_POPULATION_GAPMINDER_prod.csv", index=False)
