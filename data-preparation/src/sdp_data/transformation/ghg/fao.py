import pandas as pd
from sdp_data.utils.translation import CountryTranslatorFrenchToEnglish
from sdp_data.transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
from sdp_data.utils.format import StatisticsDataframeFormatter


class FaoDataProcessor:
    def __init__(self):
        self.dict_cols_to_rename = {
            "Area": "country",
            "Item": "sector",
            "Year": "year",
            "Unit": "ghg_unit",
            "Value": "ghg",
            "Element": "gas_before",
            "1": "gas",
        }
        self.list_sectors_to_exclude = [
            "Energy total",
            "Forest",
            "Sources total",
            "Land use sources",
            "Sources total excl. AFOLU",
            "Land Use total",
        ]
        self.dict_translation_sectors = {
            "Residential, commercial, institutional and AFF": "Residential",
            "Industrial processes and product use": "Industrial processes",
            "Agriculture total": "Agriculture",
            "Other sources": "Other",
            "Energy (energy, manufacturing and construction industries and fugitive emissions)": "Energy",
        }

    def run(self, df_fao: pd.DataFrame, df_country):
        """

        :return:
        """
        # clean countries
        print("\n----- Clean FAO dataset")
        df_fao = df_fao.drop("Area Code", axis=1)
        df_fao["Area"] = CountryTranslatorFrenchToEnglish().run(df_fao["Area"], raise_errors=False)
        df_fao = df_fao[df_fao["Area"] != "Delete"]

        # clean and add new columns
        df_fao = df_fao.rename(self.dict_cols_to_rename, axis=1)
        df_fao["ghg_unit"] = "MtCO2eq"
        df_fao["source"] = "FAO"
        df_fao["ghg"] = df_fao["ghg"] * 0.001

        # Extract gas
        df_fao = df_fao[~df_fao["gas_before"].str.contains("Share")]
        df_fao = df_fao[~df_fao["gas_before"].isin(["Emissions (CO2eq)", "share"])]
        df_fao["gas"] = df_fao["gas_before"].str.split(" ").str[-1]
        df_fao["gas"] = df_fao["gas"].replace({"F-gases": "F-Gases"})
        # TODO - ajouter un vrai module commun de traduction des gaz.

        # filter on the right sectors and countries
        # TODO - re-challenger les filtres mis sur les pays ou les secteurs.
        df_fao = df_fao.dropna(subset=["country"])
        df_fao = df_fao[df_fao["country"] != "China"]
        df_fao["country"] = df_fao["country"].replace({"China, mainland": "China"})
        df_fao = df_fao[~df_fao["sector"].isin(self.list_sectors_to_exclude)]
        df_fao["sector"] = df_fao["sector"].replace(self.dict_translation_sectors)
        df_fao = df_fao.drop(["Item Code", "Element Code", "Year Code", "Flag", "gas_before"], axis=1)
        # TODO - ajouter un vrai module commun de traduction de secteurs.
        # TODO - ajouter le filtrage Regex.

        # join with countries
        list_cols_group_by = ["group_type", "group_name", "year", "sector", "gas", "source", "ghg_unit"]
        dict_agg = {"ghg": "sum"}
        df_fao_per_country_and_zones = StatisticsPerCountriesAndZonesJoiner().run(df_fao, df_country, list_cols_group_by, dict_agg)
        df_fao_per_country_and_zones = StatisticsDataframeFormatter.select_and_sort_values(df_fao_per_country_and_zones, "ghg", round_statistics=5)
        return df_fao_per_country_and_zones
