import pandas as pd
from src.utils.format import StatisticsDataframeFormatter
from src.utils.translation import CountryTranslatorFrenchToEnglish


class PikCleaner:

    def __init__(self):
        self.list_countries_to_remove = ["World", "Non-Annex-I Parties to the Convention",  "Annex-I Parties to the Convention",
                                         "BASIC countries (Brazil, South Africa, India and China)", "Umbrella Group",
                                         "Umbrella Group (28)", "Least Developed Countries", "European Union (28)",
                                         "Alliance of Small Island States (AOSIS)"]
        self.list_sectors_to_replace = {
            "Other": "Other Sectors",
            "Industrial Processes and Product Use": "Industry and Construction"
        }

    @staticmethod
    def melt_years(df_pik: pd.DataFrame):
        return pd.melt(df_pik, id_vars=["country", "source", "sector", "gas", "ghg_unit"], var_name='year', value_name='ghg')

    def run(self, df_pik: pd.DataFrame):
        """
        Cleans the PIK dataset.
        :param df_pik:
        :return:
        """
        # cleaning data
        print("\n----- Clean PIK dataset")
        df_pik = df_pik.rename({"Country": "country", "Data source": "source", "Sector": "sector",
                                "Gas": "gas", "Unit": "ghg_unit"}, axis=1)
        df_pik = df_pik[df_pik["sector"] != "Total excluding LULUCF"]
        df_pik["sector"] = df_pik["sector"].replace(self.list_sectors_to_replace)
        df_pik = df_pik[~df_pik["country"].isin(self.list_countries_to_remove)]

        # melt years
        df_pik = self.melt_years(df_pik)
        # df_pik = df_pik.dropna(subset=["ghg"])  # TODO - jeter valeurs manquante ? Legacy Dataiku

        # translate countries
        df_pik["country"] = CountryTranslatorFrenchToEnglish().run(df_pik["country"], raise_errors=False)
        df_pik = df_pik.dropna(subset=["country"])
        df_pik = df_pik[df_pik["country"] != "Delete"]
        df_pik = StatisticsDataframeFormatter.select_and_sort_values(df_pik, "ghg", round_statistics=5)

        return df_pik
