import pandas as pd
from src.utils.iso3166 import countries_by_alpha3
from src.utils.translation import (CountryTranslatorFrenchToEnglish,
                                   SectorTranslator)


class UnfccProcessor:

    def __init__(self):
        self.list_sectors_to_remove = ["Total GHG emissions, including indirect CO2,  with LULUCF",
                                       "Total GHG emissions, including indirect CO2,  without LULUCF",
                                       "Total GHG emissions including LULUCF/LUCF",
                                       "Total GHG emissions excluding LULUCF/LUCF",
                                       "Total GHG emissions with LULUCF",
                                       "Total GHG emissions without LULUCF", "LULUCF"]
        self.list_gas_to_remove = ["Aggregate GHGs", "HFCs", "PFCs", "SF6", "NF3", "Unspecified mix of HFCs and PFCs"]
        self.countries_by_alpha3 = countries_by_alpha3
        self.countries_by_alpha3 = {k: v.name for k, v in self.countries_by_alpha3.items()}

    def translate_country_code_to_country_name(self, serie_country_code_to_translate: pd.Series, raise_errors: bool):
        serie_country_translated = serie_country_code_to_translate.map(self.countries_by_alpha3)
        countries_no_translating = list(set(serie_country_code_to_translate[serie_country_translated.isnull()].values.tolist()))
        if serie_country_code_to_translate.isnull().sum() > 0:
            print("WARN : no translating found for countries %s. Please add it in iso3166.py" % countries_no_translating)
            if raise_errors:
                raise ValueError("ERROR : no translating found for countries %s" % countries_no_translating)

        return serie_country_translated

    @staticmethod
    def melt_years(df_unfcc: pd.DataFrame):
        return pd.melt(df_unfcc, id_vars=["country", "source", "sector", "gas"], var_name='year', value_name='ghg')

    def run(self, df_unfcc: pd.DataFrame):

        # Clean data
        print("\n----- Clean UNFCC dataset")
        df_unfcc = df_unfcc.rename({"Country": "country", "Source": "source", "Sector": "sector", "Gas": "gas"}, axis=1)
        df_unfcc["country"] = self.translate_country_code_to_country_name(df_unfcc["country"], raise_errors=False)
        df_unfcc["country"] = CountryTranslatorFrenchToEnglish().run(df_unfcc["country"], raise_errors=False)
        df_unfcc = df_unfcc.drop("GWP", axis=1)

        # melt years and create new columns
        df_unfcc = self.melt_years(df_unfcc)
        df_unfcc["ghg"] = pd.to_numeric(df_unfcc["ghg"], errors="coerce")
        df_unfcc = df_unfcc[~df_unfcc["sector"].isin(self.list_sectors_to_remove)]
        df_unfcc = df_unfcc[~df_unfcc["gas"].isin(self.list_gas_to_remove)]
        df_unfcc["ghg_unit"] = "MtCO2eq"
        df_unfcc["gas"] = df_unfcc["gas"].str.replace("Aggregate F-gases", "F-gases")

        return df_unfcc




class UnfcccAnnexesCleaner:

    def __init__(self):
        pass

    @staticmethod
    def melt_years_and_gas(df_unfccc_stacked: pd.DataFrame):
        return pd.melt(df_unfccc_stacked, id_vars=["country", "sector"], var_name='year_gas', value_name='ghg')

    def run(self, df_unfccc_annex_1: pd.DataFrame, df_unfccc_annex_2: pd.DataFrame):
        """
        Cleans the Unfccc data
        :param df_unfccc_annex_1: (dataframe) contains the first part of Unfccc data.
        :param df_unfccc_annex_2: (dataframe) contains the second part of Unfccc data.
        :return: dataframe Unfccc data cleaned.
        """
        print("\n----- Clean UNFCC annexes")
        list_cols_annex_1 = [col for col in df_unfccc_annex_1.columns if "Last Inventory" not in col]
        list_cols_annex_2 = [col for col in df_unfccc_annex_2.columns if "Last Inventory" not in col]
        df_unfccc_annex_1 = df_unfccc_annex_1[list_cols_annex_1]
        df_unfccc_annex_2 = df_unfccc_annex_2[list_cols_annex_2]
        df_unfccc_annex = pd.concat([df_unfccc_annex_1, df_unfccc_annex_2], axis=0)

        # clean dataset and melt
        df_unfccc_annex = df_unfccc_annex.rename({"Party": "country", 'Category \ Unit': "sector"}, axis=1)
        df_unfccc_annex = self.melt_years_and_gas(df_unfccc_annex)
        df_unfccc_annex["sector"] = SectorTranslator().translate_sector_unfccc_data(df_unfccc_annex["sector"], raise_errors=False)
        df_unfccc_annex["country"] = CountryTranslatorFrenchToEnglish().run(df_unfccc_annex["country"], raise_errors=False)

        # split years and gas
        df_unfccc_annex["year"] = df_unfccc_annex["year_gas"].str.split(" ").map(lambda x: x[0])
        df_unfccc_annex["gas"] = df_unfccc_annex["year_gas"].str.split(" ").map(lambda x: x[1])
        df_unfccc_annex = df_unfccc_annex.drop("year_gas", axis=1)

        # convert ghg and drop missing values # TODO - ajouter la conversion des données non CO2 comme dans les données Edgar ?
        df_unfccc_annex["ghg"] = 0.001 * pd.to_numeric(df_unfccc_annex["ghg"], errors="coerce")
        df_unfccc_annex["ghg_unit"] = "MtCO2eq"
        df_unfccc_annex = df_unfccc_annex.dropna(subset=["country"], axis=0)  # TODO - to fix dans les données originales se trouvent des données avec GHG manquant. A corriger ?
        df_unfccc_annex = df_unfccc_annex[df_unfccc_annex["ghg"] != 0.0]  # TODO - TOFIX, dans le pipeline actuel, ces donénes sont supprimées mais cea ne fait pas sens. Proposition de les garder.
        return df_unfccc_annex

