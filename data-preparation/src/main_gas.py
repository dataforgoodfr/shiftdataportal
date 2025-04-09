import pandas as pd
import os
from utils.translation import CountryTranslatorFrenchToEnglish
from transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
from utils.format import StatisticsDataframeFormatter


# infos sur les données:
# Les données ont été téléchargées depuis le site de l'OPEC https://publications.opec.org/asb/Download
# pour les télécharger, il est nécessaire de créer un compte. On télécharge alors un excel.


class OpecFossilProvenReservesCleaner:
    def __init__(self):
        self.list_countries_to_drop = ['Africa', 'Latin America', 'Other Asia', 'Other Eurasia', 'Middle East',
                                       'OECD Europe', 'OECD Asia Pacific', 'OECD Americas', 'Others', 'Other Europe',
                                       'Total World', 'of which', 'OPEC', 'OPEC percentage', 'OECD']

    @staticmethod
    def drop_first_row(df_gas_reserves):
        df_gas_reserves.drop(index=0)
        return df_gas_reserves

    @staticmethod
    def set_columns(df_gas_reserves):
        df_gas_reserves.rename(columns={df_gas_reserves.columns[0]: "country"}, inplace=True)  # Rename first column
        return df_gas_reserves

    @staticmethod
    def convert_types(df_gas_reserves):
        df_gas_reserves.loc[:, 'year'] = pd.to_numeric(df_gas_reserves["year"], errors="coerce")
        df_gas_reserves.loc[:, 'country'] = df_gas_reserves['country'].astype(str)
        df_gas_reserves.loc[:, 'proven_reserves'] = pd.to_numeric(df_gas_reserves["proven_reserves"], errors="coerce")
        return df_gas_reserves

    def drop_unnecessary_lines(self, df_gas_reserves):
        df_gas_reserves = df_gas_reserves[~df_gas_reserves['country'].str.strip().isin(self.list_countries_to_drop)]
        return df_gas_reserves

    @staticmethod
    def translate_country(df_gas_reserves):
        df_gas_reserves = df_gas_reserves.reset_index()
        df_gas_reserves["country"] = CountryTranslatorFrenchToEnglish().run(df_gas_reserves["country"], raise_errors=False)
        return df_gas_reserves

    @staticmethod
    def column_to_line(df_gas_reserves):
        df_gas_reserves = pd.melt(df_gas_reserves,
                                  id_vars="country",
                                  var_name="year",
                                  value_name="proven_reserves")
        return df_gas_reserves.dropna()

    @staticmethod
    def drop_nan(df_gas_reserves):
        df_gas_reserves = df_gas_reserves.dropna()
        return df_gas_reserves

    @staticmethod
    def stat_per_countries_zones_join(df_gas_reserves, country):
        list_col_group_by = ['group_type', 'group_name', 'year', 'energy_source', 'proven_reserves_unit']
        dict_agg = {"proven_reserves": "sum"}
        df_gas_reserves = StatisticsPerCountriesAndZonesJoiner().run(df_gas_reserves, country, list_col_group_by, dict_agg)
        return df_gas_reserves

    @staticmethod
    def stat_df_gas_reserves_formatter(df_gas_reserves):
        df_gas_reserves = StatisticsDataframeFormatter().select_and_sort_values(df_gas_reserves, "proven_reserves")
        df_gas_reserves = df_gas_reserves[["group_type", "group_name", "energy_source", "year", "proven_reserves", "proven_reserves_unit"]]
        return df_gas_reserves

    def run(self, df_country: pd.DataFrame):
        """
        Processes OPEC gas reserves data
        :param df_country:
        :return:
        """
        # load data
        path_gas_reserves = os.path.join(os.getcwd(), "../../data/raw/reserves/opec_proved_reserves_gas_2023.xlsx")
        df_gas_reserves = pd.read_excel(path_gas_reserves)

        # prepare data
        df_gas_reserves = self.set_columns(df_gas_reserves)
        df_gas_reserves = self.drop_unnecessary_lines(df_gas_reserves)
        df_gas_reserves = self.translate_country(df_gas_reserves)
        df_gas_reserves = self.column_to_line(df_gas_reserves)
        df_gas_reserves = self.convert_types(df_gas_reserves)
        df_gas_reserves = self.drop_nan(df_gas_reserves)



        # add unit and source
        df_gas_reserves["energy_source"] = "Gas"
        df_gas_reserves["proven_reserves_unit"] = "Bcm"

        # stats per countries and zones. Then format results
        df_gas_reserves = self.stat_per_countries_zones_join(df_gas_reserves, df_country)
        df_gas_reserves = self.stat_df_gas_reserves_formatter(df_gas_reserves)


        return df_gas_reserves


if __name__ == "__main__":

    # read countries
    current_dir = os.getcwd()
    path_countries = os.path.join(current_dir, "../../data/raw/demographics/country_groups.csv")
    df_country = pd.read_csv(path_countries)

    # process OPEC oil reserves data
    df_gas_reserves = OpecFossilProvenReservesCleaner().run(df_country)

    # load current gas reserves file and replace with new data
    path_prod_gas_reserves = "../../server/data/FOSSIL_RESERVES_bp_fossil_with_zones_prod.csv"
    df_prod_reserves = pd.read_csv(path_prod_gas_reserves)
    df_prod_reserves = df_prod_reserves[df_prod_reserves["energy_source"] != "Gas"]
    df_gas_reserves = pd.concat([df_gas_reserves, df_prod_reserves], axis=0)

    # reformat data
    col_statistics = "proven_reserves"
    df_gas_reserves = StatisticsDataframeFormatter().select_and_sort_values(df_gas_reserves, col_statistics)
    df_gas_reserves = df_gas_reserves[["group_type", "group_name", "energy_source", "year", "proven_reserves", "proven_reserves_unit"]]

    # export to CSV
    path_export_gas = os.path.join(current_dir,
                                   "../../data/processed/gas/FOSSIL_RESERVES_bp_fossil_with_zones_prod.csv")
    df_gas_reserves.to_csv(path_export_gas, index=False)