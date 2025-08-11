from transformation.demographic.population import WorldbankPopulationProcessor
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
    df_population_worldbank = WorldbankPopulationProcessor().run(df_population_raw, df_country)
    df_population_worldbank = StatisticsDataframeFormatter().select_and_sort_values(df_population_worldbank, "population")
    df_population_worldbank.to_csv(f"../../data/processed/demographics/DEMOGRAPHIC_POPULATION_WORLDBANK_prod.csv", index=False)
