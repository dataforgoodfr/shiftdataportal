import pandas as pd
import os
from utils.translation import CountryTranslatorFrenchToEnglish
from transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
from utils.format import StatisticsDataframeFormatter

# TODO - vérifier droits de licence OPEC

# TODO - rempalcer les totaux par ceux déjà donnés dans le fichier ?

# infos sur les données
# Les données ont été télhargées depuis le site de l'OPEC https://publications.opec.org/asb/Download
# pour les télcharger, il est nécessaire de créer un compte. On télécharge alors un excel.
# les deux premmières lignes et les dernières lignes ont été supprimées pour faciloetr la lecture.


class OpecFossilProvenReservesCleaner:
    def __init__(self):
        self.list_countries_to_drop = ['Africa ', 'Latin America', 'Other Asia', 'Other Eurasia', 'Middle East ',
                                       'OECD Europe', 'OECD Asia Pacific', 'OECD Americas', 'Others', 'Other Europe',
                                       'Total World']

    @staticmethod
    def rename_column(df_oil_reserves):
        return df_oil_reserves.rename(columns={'Unnamed: 0': 'country'})

    def drop_unnecessary_lines(self, df_oil_reserves):
        """
        Drop footnotes not necessary for data processing
        """
        df_oil_reserves.set_index('country', inplace=True)
        df_oil_reserves = df_oil_reserves[df_oil_reserves.index.isin(self.list_countries_to_drop) == False]
        return df_oil_reserves

    @staticmethod
    def mb_to_gb_scale(df_oil_reserves):
        for col in df_oil_reserves.columns:
            df_oil_reserves[col] = pd.to_numeric(df_oil_reserves[col], errors='coerce') / 1000
        return df_oil_reserves

    @staticmethod
    def translate_country(df_oil_reserves):
        df_oil_reserves = df_oil_reserves.reset_index()
        df_oil_reserves["country"] = CountryTranslatorFrenchToEnglish().run(df_oil_reserves["country"], raise_errors=False)
        return df_oil_reserves

    @staticmethod
    def column_to_line(df_oil_reserves):
        df_oil_reserves = pd.melt(df_oil_reserves,
                                  id_vars="country",
                                  var_name="year",
                                  value_name="proven_reserves")
        return df_oil_reserves.dropna()

    @staticmethod
    def stat_per_countries_zones_join(df_oil_reserves, country):
        list_col_group_by = ['group_type', 'group_name', 'year', 'energy_source', 'proven_reserves_unit']
        dict_agg = {"proven_reserves": "sum"}
        df_oil_reserves = StatisticsPerCountriesAndZonesJoiner().run(df_oil_reserves, country, list_col_group_by, dict_agg)
        return df_oil_reserves

    @staticmethod
    def stat_df_oil_reserves_formatter(df_oil_reserves):
        df_oil_reserves = StatisticsDataframeFormatter().select_and_sort_values(df_oil_reserves, "proven_reserves")
        df_oil_reserves = df_oil_reserves[["group_type", "group_name", "energy_source", "year", "proven_reserves", "proven_reserves_unit"]]
        return df_oil_reserves

    def run(self, df_country: pd.DataFrame):
        """
        Processes OPEC oil reserves data
        :param df_country:
        :return:
        """
        # load data
        path_oil_reserves = os.path.join(os.getcwd(), "../../../../data/raw/reserves/opec_proved_reserves_2023.xlsx")
        df_oil_reserves_oil_reserves = pd.read_excel(path_oil_reserves)

        # prepare data
        df_oil_reserves = self.rename_column(df_oil_reserves_oil_reserves)
        df_oil_reserves = self.drop_unnecessary_lines(df_oil_reserves)
        df_oil_reserves = self.mb_to_gb_scale(df_oil_reserves)
        df_oil_reserves = self.translate_country(df_oil_reserves)
        df_oil_reserves = self.column_to_line(df_oil_reserves)

        # add unit and source
        df_oil_reserves["energy_source"] = "Oil"
        df_oil_reserves["proven_reserves_unit"] = "Gb"

        # stats per countries and zones. Then format results
        df_oil_reserves = self.stat_per_countries_zones_join(df_oil_reserves, df_country)
        df_oil_reserves = self.stat_df_oil_reserves_formatter(df_oil_reserves)

        return df_oil_reserves


if __name__ == "__main__":

    # read countries
    current_dir = os.getcwd()
    path_countries = os.path.join(current_dir, "../../../../data/raw/demographics/country_groups.csv")
    df_country = pd.read_csv(path_countries)

    # process OPEC oil reserves data
    df_oil_reserve = OpecFossilProvenReservesCleaner().run(df_country)

    # load current oil reserves file and replace with new data
    path_prod_oil_reserves = "../../../../server/data/FOSSIL_RESERVES_bp_fossil_with_zones_prod.csv"
    df_prod_reserves = pd.read_csv(path_prod_oil_reserves)
    df_prod_reserves = df_prod_reserves[df_prod_reserves["energy_source"] != "Oil"]
    df_oil_reserve = pd.concat([df_oil_reserve, df_prod_reserves], axis=0)

    # reformat data
    col_statistics = "proven_reserves"
    df_oil_reserve = StatisticsDataframeFormatter().select_and_sort_values(df_oil_reserve, col_statistics)
    df_oil_reserve = df_oil_reserve[["group_type", "group_name", "energy_source", "year", "proven_reserves", "proven_reserves_unit"]]

    # export to CSV
    path_export_oil = os.path.join(current_dir, "../../../../data/processed/reserves/FOSSIL_RESERVES_bp_fossil_with_zones_prod.csv")
    df_oil_reserve.to_csv(path_export_oil, index=False)
