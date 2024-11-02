import sys
from transformation.demographic.population import GapMinderPerZoneAndCountryProcessor, PopulationPerZoneAndCountryProcessor
from transformation.demographic.population import StatisticsPerCapitaJoiner
from transformation.co2_consumption_based_accounting import EoraCo2TradePerZoneAndCountryProcessor
from transformation.footprint_vs_territorial import FootprintVsTerrotorialProcessor
from transformation.demographic.worldbank_scrap import WorldBankScrapper
from transformation.demographic.gdp import GdpMaddissonPerZoneAndCountryProcessor, \
    GdpWorldBankPerZoneAndCountryProcessor
from transformation.eia import EiaConsumptionGasBySectorProcessor, EiaConsumptionOilPerProductProcessor, \
    EiaFinalEnergyConsumptionProcessor, EiaFinalEnergyPerSectorPerEnergyProcessor, \
    EiaElectricityGenerationByEnergyProcessor, EiaConsumptionOilsPerSectorProcessor, \
    EiaFinalEnergyConsumptionPerSectorProcessor
from utils.format import StatisticsDataframeFormatter
from transformation.ghg.pik import PikCleaner
from transformation.ghg.edgar import EdgarCleaner
from transformation.ghg.ghg import GhgPikEdgarCombinator, PikUnfcccAnnexesCombinator, EdgarUnfcccAnnexesCombinator, GhgMultiSourcesCombinator
from transformation.ghg.unfcc import UnfcccAnnexesCleaner, UnfccProcessor
from transformation.ghg.fao import FaoDataProcessor
from transformation.ghg.cait import CaitProcessor
import pandas as pd
import os
import requests
from pandas import json_normalize

RAW_DATA_DIR = os.path.join(os.path.dirname(__file__), "../../results/raw_new_data")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "../../results/new_prod_data")
CURRENT_DATA_DIR = os.path.join(os.path.dirname(__file__), "../../results/current_data")
CURRENT_PROD_DATA = os.path.join(os.path.dirname(__file__), "../../results/current_prod_data")


class TransformationPipeline:

    def process_country_data(self):
        # Update demographic data
        df_country = pd.read_csv(f"{RAW_DATA_DIR}/country/country_groups.csv")
        df_country = df_country.sort_values(by=["group_type", "group_name", "country"])
        df_country.to_csv(f"{RESULTS_DIR}/COUNTRY_country_groups_prod.csv", index=False)
        return df_country

    def process_population_data(self, df_country):
        # update population data (World Bank)
        df_population_raw = WorldBankScrapper().run("population")
        df_population = PopulationPerZoneAndCountryProcessor().run(df_population_raw, df_country)
        df_population.to_csv(f"{RESULTS_DIR}/DEMOGRAPHIC_POPULATION_WORLDBANK_prod.csv", index=False)

        # update GapMinder data (source GapMinder)
        df_population_gapmidner_raw = pd.read_excel(f"{RAW_DATA_DIR}/population/GM-Population - Dataset - v7.xlsx",
                                                    sheet_name="data-pop-gmv6-in-columns")
        df_gapminder = GapMinderPerZoneAndCountryProcessor().run(df_population_gapmidner_raw, df_country)
        df_gapminder.to_csv(f"{RESULTS_DIR}/DEMOGRAPHIC_POPULATION_GAPMINDER_prod.csv", index=False)
        return df_population, df_gapminder

    def process_footprint_vs_territorial_data(self, df_country, df_population):
        # update footprint vs territorial
        df_eora_cba = pd.read_csv(f"{RAW_DATA_DIR}/co2_cba/national.cba.report.1990.2022.txt", sep="\t")
        df_gcb_territorial = pd.read_excel(f"{RAW_DATA_DIR}/co2_cba/National_Fossil_Carbon_Emissions_2023v1.0.xlsx",
                                           sheet_name="Territorial Emissions")
        df_gcb_cba = pd.read_excel(f"{RAW_DATA_DIR}/co2_cba/National_Fossil_Carbon_Emissions_2023v1.0.xlsx",
                                   sheet_name="Consumption Emissions")
        df_footprint_vs_territorial = FootprintVsTerrotorialProcessor().run(df_gcb_territorial, df_gcb_cba, df_eora_cba,
                                                                            df_country)
        df_footprint_vs_territorial.to_csv(
            f"{RESULTS_DIR}/CO2_CONSUMPTION_BASED_ACCOUNTING_footprint_vs_territorial_prod.csv", index=False)

        df_footprint_vs_territorial_per_capita = StatisticsPerCapitaJoiner().run_footprint_vs_territorial_per_capita(
            df_footprint_vs_territorial, df_population)
        df_footprint_vs_territorial_per_capita.to_csv(
            f"{RESULTS_DIR}/CO2_CBA_PER_CAPITA_eora_cba_zones_per_capita_prod.csv", index=False)

    def process_iea_data(self, df_country):
        # gas products
        df_gas_cons_by_sector = EiaConsumptionGasBySectorProcessor().prepare_data(df_country)
        df_gas_cons_by_sector.to_csv(f"{RESULTS_DIR}/FINAL_CONS_GAS_BY_SECTOR_prod.csv", index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/final_cons_gas_by_sector_prod.csv", sep=',')
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "final_energy",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/FINAL_CONS_GAS_BY_SECTOR_prod.csv", index=False)

        # oil products
        df_oil_cons_per_product = EiaConsumptionOilPerProductProcessor().prepare_data(df_country)
        df_oil_cons_per_product.to_csv(f"{RESULTS_DIR}/FINAL_CONS_OIL_BY_PRODUCT_prod.csv", index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/final_cons_oil_products_by_product.csv", sep=',')
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "final_energy",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/FINAL_CONS_OIL_BY_PRODUCT_prod.csv", index=False)

        df_oil_cons_per_sector = EiaConsumptionOilsPerSectorProcessor().prepare_data(df_country)
        df_oil_cons_per_sector.to_csv(f"{RESULTS_DIR}/FINAL_CONS_OIL_BY_SECTOR_prod.csv", index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/final_cons_oil_products_by_sector_prod.csv", sep=',')
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "final_energy",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/FINAL_CONS_OIL_BY_SECTOR_prod.csv", index=False)

        # final energy
        df_final_energy_consumption = EiaFinalEnergyConsumptionProcessor().prepare_data(df_country)
        df_final_energy_consumption.to_csv(f"{RESULTS_DIR}/FINAL_ENERGY_CONSUMPTION_prod.csv", index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/final_cons_by_energy_family_prepared.csv", sep=',')
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "final_energy",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/FINAL_ENERGY_CONSUMPTION_prod.csv", index=False)

        df_final_energy_consumption_per_sector = EiaFinalEnergyConsumptionPerSectorProcessor().prepare_data(df_country)
        df_final_energy_consumption_per_sector.to_csv(f"{RESULTS_DIR}/FINAL_ENERGY_CONSUMPTION_PER_SECTOR_prod.csv",
                                                      index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/final_cons_by_sector_prod.csv", sep=',')
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "final_energy",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/FINAL_ENERGY_CONSUMPTION_PER_SECTOR_prod.csv", index=False)

        df_energy_per_sector_per_energy_family = EiaFinalEnergyPerSectorPerEnergyProcessor().prepare_data(df_country)
        df_energy_per_sector_per_energy_family.to_csv(
            f"{RESULTS_DIR}/FINAL_ENERGY_PER_SECTOR_PER_ENERGY_FAMILY_prod.csv", index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/final_cons_by_sector_by_energy_family_prod.csv", sep=',')
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "final_energy",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/FINAL_ENERGY_PER_SECTOR_PER_ENERGY_FAMILY_prod.csv", index=False)

        # electricity generation
        electricity_generator = EiaElectricityGenerationByEnergyProcessor().prepare_data(df_country)
        df_electricity_generation = electricity_generator.df_electricity_by_energy_family
        df_electricity_generation.to_csv(f"{RESULTS_DIR}/ELECTRICITY_GENERATION_prod.csv", index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/electricity_by_energy_family_prepared_prod.csv", sep=',')
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "final_energy",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/ELECTRICITY_CO2_INTENSITY_prod.csv", index=False)

        df_electricity_nuclear_share = electricity_generator.compute_nuclear_share_in_electricity()
        df_electricity_nuclear_share.to_csv(f"{RESULTS_DIR}/ELECTRICITY_NUCLEAR_SHARE_prod.csv", index=False)
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/nuclear_share_of_electricity_generation_prod.csv", sep=',')
        df_original["nuclear"] = df_original["nuclear"].round(4)
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original,
                                                                          "nuclear_share_of_electricity_generation",
                                                                          round_statistics=4)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/ELECTRICITY_NUCLEAR_SHARE_prod.csv", index=False)

        df_intensity_co2_per_energy = pd.read_excel(os.path.join(os.path.join(os.path.dirname(__file__),
                                                                              "../../data/thibaud/eia_api/co2_intensity_electricity_by_energy.xlsx")))
        df_electricity_co2_intensity = electricity_generator.compute_electricity_co2_intensity(
            df_intensity_co2_per_energy)
        df_electricity_co2_intensity.to_csv(f"{RESULTS_DIR}/ELECTRICITY_CO2_INTENSITY_prod.csv", index=False, sep=',')
        df_original = pd.read_csv(f"{CURRENT_DATA_DIR}/country_co2_intensity.csv")
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "co2_intensity",
                                                                          round_statistics=3)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/ELECTRICITY_CO2_INTENSITY_prod.csv", index=False)

    def process_ghg_data(self, df_country):
        # update PIK data
        df_pik = pd.read_csv(f"{RAW_DATA_DIR}/ghg/Guetschow_et_al_2023b-PRIMAP-hist_v2.5_final_15-Oct-2023.csv")
        df_pik_cleaned = PikCleaner().run(df_pik)
        df_pik_cleaned.to_csv(f"{RESULTS_DIR}/GHG_PIK_WITH_EDGAR_SECTORS_prod.csv", index=False)
        df_original = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "pik_with_edgar_sectors.xlsx"))
        df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "ghg", round_statistics=5)
        df_original.to_csv(f"{CURRENT_PROD_DATA}/GHG_PIK_WITH_EDGAR_SECTORS_prod.csv",
                           index=False)  # TODO - supprimer cet export ? Pas utilisé dans la BDD de PROD.

        # update EDGAR data
        df_edgar_gases = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "edgar_f_gases.xlsx"))
        df_edgar_n2o = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "edgar_n2o_raw.xlsx"))
        df_edgar_ch4 = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "edgar_ch4_raw.xlsx"))
        df_edgar_co2_short_cycle = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "edgar_co2_shortcycle_raw.xlsx"))
        df_edgar_co2_short_without_cycle = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "edgar_co2_withoutshortcycle_raw.xlsx"))
        df_edgar_clean = EdgarCleaner().run(df_edgar_gases, df_edgar_n2o, df_edgar_ch4, df_edgar_co2_short_cycle,
                                            df_edgar_co2_short_without_cycle)

        # combine PIK and EDGAR data STACKED  # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        # df_pik_edgar_stacked = GhgPikEdgarCombinator().compute_pik_edgar_stacked(df_pik_cleaned, df_edgar_clean)
        # df_pik_edgar_stacked.to_csv(f"{RESULTS_DIR}/GHG_PIK_EDGAR_STACKED_prod.csv", index=False)
        # df_original = pd.read_csv(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "pik_edgar_stacked.csv"))
        # df_original["source"] = df_original["source"].fillna("edgar")
        # df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "ghg", round_statistics=5)
        # df_original.to_csv(f"{CURRENT_PROD_DATA}/GHG_PIK_EDGAR_STACKED_prod.csv", index=False)

        # combine PIK and EDGAR data FILTER SECTOR   # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        # df_pik_edgar_sector = GhgPikEdgarCombinator().compute_pik_edgar_filter_sector(df_pik_cleaned, df_edgar_clean)
        # df_pik_edgar_sector.to_csv(f"{RESULTS_DIR}/GHG_PIK_EDGAR_SECTOR_prod.csv", index=False)
        # df_original = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "pik_edgar_1.xlsx"))
        # df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "ghg", round_statistics=5)
        # df_original.to_csv(f"{CURRENT_PROD_DATA}/GHG_PIK_EDGAR_SECTOR_prod.csv", index=False)

        # combine PIK and EDGAR EXTRAPOLATED GLUED    # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        # df_pik_edgar_extrapolated = GhgPikEdgarCombinator().compute_pik_edgar_extrapolated_glued(df_pik_cleaned, df_edgar_clean)
        # df_pik_edgar_extrapolated.to_csv(f"{RESULTS_DIR}/GHG_PIK_EDGAR_EXTRAPOLATED_GLUED_prod.csv", index=False)
        # df_original = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "edgar_pik_extrapolated_glued_prod.xlsx"))
        # df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "ghg", round_statistics=5)
        # df_original.to_csv(f"{CURRENT_PROD_DATA}/GHG_PIK_EDGAR_EXTRAPOLATED_GLUED_prod.csv", index=False)

        # update UNFCCC annexes data  # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        # df_unfccc_annex_1 = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "unfccc_annex1.xlsx"))
        # df_unfccc_annex_2 = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "unfccc_annex2.xlsx"))
        # df_unfccc_annex_clean = UnfcccAnnexesCleaner().run(df_unfccc_annex_1, df_unfccc_annex_2)

        # combine PIK and UNFCCC annexes data  # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        # df_pik_unfccc_annexes = PikUnfcccAnnexesCombinator().run(df_pik_cleaned, df_unfccc_annex_clean)
        # df_pik_unfccc_annexes.to_csv(f"{RESULTS_DIR}/GHG_PIK_UNFCCC_prod.csv", index=False)
        # df_original = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "pik_unfccc.xlsx"))
        # df_original = StatisticsDataframeFormatter.select_and_sort_values(df_original, "ghg", round_statistics=4)
        # df_original.to_csv(f"{CURRENT_PROD_DATA}/GHG_PIK_UNFCCC_prod.csv", index=False)

        # combine EDGR and UNFCCC data # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        # df_ghg_edunf_by_gas, df_ghg_edunf_by_sector = EdgarUnfcccAnnexesCombinator().run(df_edgar_clean, df_unfccc_annex_clean, df_country)
        # df_ghg_edunf_by_gas.to_csv(f"{RESULTS_DIR}/GHG_EDUNF_BY_GAS_prod.csv", index=False)
        # df_ghg_edunf_by_sector.to_csv(f"{RESULTS_DIR}/GHG_EDUNF_BY_SECTOR_prod.csv", index=False)
        # df_original_gas = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "ghg_edunf_by_gas_prod.xlsx"))
        # df_original_gas = StatisticsDataframeFormatter.select_and_sort_values(df_original_gas, "ghg", round_statistics=4)
        # df_original_gas.to_csv(f"{CURRENT_PROD_DATA}/GHG_EDUNF_BY_GAS_prod.csv", index=False)
        # df_original_sector = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "ghg_edunf_by_sector_prod.xlsx"))
        # df_original_sector = StatisticsDataframeFormatter.select_and_sort_values(df_original_sector, "ghg", round_statistics=4)
        # df_original_sector.to_csv(f"{CURRENT_PROD_DATA}/GHG_EDUNF_BY_SECTOR_prod.csv", index=False)

        # update UNFCC data  # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        # df_unfcc = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "unfcc.xlsx"))
        # df_unfcc_clean = UnfccProcessor().run(df_unfcc)  # TODO - à fixer - We can't use UNFCCC because for non annex 1 countries (ex:China) we only have data every 5 years

        # update FAO data
        df_fao = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "fao_raw.xlsx"))
        df_fao_clean = FaoDataProcessor().run(df_fao, df_country)

        # update CAIT data
        df_cait = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "cait_raw.xlsx"))
        df_cait_sector_stacked, df_cait_gas_stacked = CaitProcessor().run(df_cait, df_country)

        # combine all sources together  # TODO - potentiellement à supprimer car pas utilisé en PROD (ref 21/04)
        list_df_multi_sources = GhgMultiSourcesCombinator().run(df_pik_clean=df_pik_cleaned,
                                                                df_edgar_clean=df_edgar_clean,
                                                                df_fao_clean=df_fao_clean,
                                                                df_cait_sector_stacked=df_cait_sector_stacked,
                                                                df_cait_gas_stacked=df_cait_gas_stacked,
                                                                df_country=df_country
                                                                )
        df_ghg_full_by_gas, df_ghg_full_by_sector, df_ghg_full_aggregated = list_df_multi_sources
        df_ghg_full_by_gas.to_csv(f"{RESULTS_DIR}/GHG_FULL_BY_GAS_prod.csv", index=False)
        df_ghg_full_by_sector.to_csv(f"{RESULTS_DIR}/GHG_FULL_BY_SECTOR_prod.csv", index=False)
        df_ghg_full_aggregated.to_csv(f"{RESULTS_DIR}/GHG_FULL_AGGREGATED_prod.csv", index=False)

        df_original_gas = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "ghg_full_by_gas_prod.xlsx"))
        df_original_gas = StatisticsDataframeFormatter.select_and_sort_values(df_original_gas, "ghg",
                                                                              round_statistics=5)
        df_original_gas.to_csv(f"{CURRENT_PROD_DATA}/GHG_FULL_BY_GAS_prod.csv", index=False)

        df_original_sector = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "ghg_full_by_sector_prod.xlsx"))
        df_original_sector = StatisticsDataframeFormatter.select_and_sort_values(df_original_sector, "ghg",
                                                                                 round_statistics=5)
        df_original_sector.to_csv(f"{CURRENT_PROD_DATA}/GHG_FULL_BY_SECTOR_prod.csv", index=False)

        df_original_agg = pd.read_excel(
            os.path.join(os.path.dirname(__file__), "../../data/thibaud/ghg/" + "ghg_full_aggregated.xlsx"))
        df_original_agg = StatisticsDataframeFormatter.select_and_sort_values(df_original_agg, "ghg",
                                                                              round_statistics=5)
        df_original_agg.to_csv(f"{CURRENT_PROD_DATA}/GHG_FULL_AGGREGATED_prod.csv", index=False)

    def run(self):
        """

        :return:
        """
        # demographic data
        df_country = self.process_country_data()
        # df_population, df_gapminder = self.process_population_data(df_country)

        # consumption-based accounting
        # self.process_footprint_vs_territorial_data(df_country)

        # EAI data
        # self.process_iea_data(df_country)

        # update GHG emissions data
        self.process_ghg_data(df_country)

        # update GDP data (World Bank)
        """
        df_gdp_raw = WorldBankScrapper().run("gdp")
        df_population = GdpWorldBankPerZoneAndCountryProcessor().run(df_gdp_raw, df_country)
        df_population.to_csv(f"{RESULTS_DIR}/DEMOGRAPHIC_GDP_prod.csv", index=False)

        # Compute CO2 consumption based accounting
        df_gcb_territorial = pd.read_excel("../../data/thibaud/co2_consumption_based_accounting/gcb_territorial.xlsx")
        df_gcb_cba = pd.read_excel("../../data/thibaud/co2_consumption_based_accounting/gcb_cba.xlsx")

        df_eora_co2_trade = pd.read_excel("../../data/thibaud/co2_consumption_based_accounting/eora_co2_trade_sectorwise.xlsx")
        df_trade_by_country, df_trade_by_sector = EoraCo2TradePerZoneAndCountryProcessor().run(df_eora_co2_trade, df_country)

        # compute statistics per capita
        df_population_gm_zones = pd.read_excel("../../data/thibaud/per_capita/population_gm_zones_energy.xlsx")
        df_energy = pd.read_excel("../../data/thibaud/per_capita/energies.xlsx")
        df_energy_consumption = pd.read_excel("../../data/thibaud/per_capita/energy_consumption_per_capita/final_cons_full.xlsx")
        df_ghg_by_sector = pd.read_excel("../../data/thibaud/per_capita/ghg_per_capita/ghg_full_by_sector.xlsx")
        df_historical_co2 = pd.read_excel("../../data/thibaud/per_capita/historical_co2_per_capita/eia_with_zones_aggregated.xlsx")

        df_eora_cba_per_capita = StatisticsPerCapitaJoiner().run_eora_cba_per_capita(df_footprint_vs_territorial, df_population)
        df_energy_per_capita = StatisticsPerCapitaJoiner().run_energy_per_capita(df_energy, df_population_gm_zones)
        df_final_energy_per_capita = StatisticsPerCapitaJoiner().run_final_energy_consumption_per_capita(df_energy_consumption, df_population)
        df_ghg_per_capita = StatisticsPerCapitaJoiner().run_ghg_per_capita(df_ghg_by_sector, df_population)
        df_historical_co2_per_capita = StatisticsPerCapitaJoiner().run_historical_emissions_per_capita(df_historical_co2, df_population)
        """


if __name__ == "__main__":
    TransformationPipeline().run()
