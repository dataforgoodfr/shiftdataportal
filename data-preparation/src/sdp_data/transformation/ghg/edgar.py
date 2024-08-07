import pandas as pd
import numpy as np
from sdp_data.utils.translation import CountryTranslatorFrenchToEnglish, SectorTranslator
from sdp_data.utils.format import StatisticsDataframeFormatter


class EdgarCleaner:

    def __init__(self):
        self.dict_gas_to_replace = {"PFC": "F-Gas", "HFC": "F-Gas", "SF6": "F-Gas"}

    @staticmethod
    def melt_years(df_edgar_stacked: pd.DataFrame):
        return pd.melt(df_edgar_stacked, id_vars=["country", "sector", "gas"], var_name='year', value_name='ghg')

    @staticmethod
    def convert_ghg_with_gas(ghg, gas):
        if gas == "N2O":  # TODO - mettre à jour conversion pour les gaz EDGAR
            return ghg * 298
        elif gas == "CH4":
            return ghg * 25
        elif gas == "CO2":
            return ghg
        elif gas in ["SF6", "HFC", "HFCs", "PFC", "F-Gas"]:  # TODO - ajouter une conversion pour ces gas ?
            return ghg
        else:
            raise ValueError("ERR : unknown gas : %s" % gas)

    @staticmethod
    def custom_sum_sentive_nan(series):
        if series.isna().all():
            return np.nan
        return series.sum()

    def run(self, df_edgar_gases, df_edgar_n2o, df_edgar_ch4, df_edgar_co2_short_cycle, df_edgar_co2_short_without_cycle):
        """
        Aggregates and cleans the different EDGAR data files related to gas statistics
        :param df_edgar_n2o: (dataframe) containing the N20 data.
        :param df_edgar_ch4:(dataframe) containing the CH4 data.
        :param df_edgar_co2_short_cycle: (dataframe) containing the CO2 short-cycle data.
        :param df_edgar_co2_short_without_cycle: (dataframe) containing the CO2 without short-cycle data.
        :param df_edgar_gases:
        :return:
        """
        # stack the different gas together
        print("\n----- Clean EDGAR dataset")
        df_edgar_n2o["gas"] = "N2O"
        df_edgar_ch4["gas"] = "CH4"
        df_edgar_co2_short_cycle["gas"] = "CO2"
        df_edgar_co2_short_without_cycle["gas"] = "CO2"
        df_edgar_stacked = pd.concat([df_edgar_n2o, df_edgar_ch4, df_edgar_co2_short_cycle,
                                      df_edgar_co2_short_without_cycle, df_edgar_gases])

        # melt years and create new columns
        df_edgar_stacked = df_edgar_stacked.rename({"Name": "country", "IPCC_description": "sector"}, axis=1)
        df_edgar_stacked = df_edgar_stacked.drop(["IPCC-Annex", "ISO_A3", "World Region", "IPCC"], axis=1)
        df_edgar_stacked = self.melt_years(df_edgar_stacked)
        df_edgar_stacked["sector"] = SectorTranslator().translate_sector_edgar_data(df_edgar_stacked["sector"], raise_errors=False)

        # convert ghg and drop missing values # TODO - ajouter la conversion des données non CO2 comme dans les données Edgar ?
        df_edgar_stacked["gas"] = df_edgar_stacked["gas"].replace(self.dict_gas_to_replace)
        df_edgar_stacked["ghg"] = 0.001 * pd.to_numeric(df_edgar_stacked["ghg"], errors="coerce")
        df_edgar_stacked["ghg"] = df_edgar_stacked.apply(lambda row: self.convert_ghg_with_gas(row["ghg"], row["gas"]), axis=1)
        df_edgar_stacked["ghg_unit"] = "MtCO2eq"

        # sum all ghg and clean countries
        list_groupby = ["country", "sector", "gas", "year", "ghg_unit"]
        df_edgar_stacked = df_edgar_stacked.groupby(list_groupby)["ghg"].agg(self.custom_sum_sentive_nan).reset_index()  # TODO - corriger les valeurs manquantes ?
        df_edgar_stacked["country"] = CountryTranslatorFrenchToEnglish().run(df_edgar_stacked["country"], raise_errors=False)
        df_edgar_stacked["country"] = df_edgar_stacked["country"].replace({"Reunion": "Réunion"})  # TODO - à corriger dans fichier translation
        df_edgar_stacked = df_edgar_stacked.dropna(subset=["country"])
        df_edgar_stacked = StatisticsDataframeFormatter.select_and_sort_values(df_edgar_stacked, "ghg", round_statistics=5)

        return df_edgar_stacked
