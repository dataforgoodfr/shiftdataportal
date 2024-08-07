import pandas as pd
from sdp_data.utils.translation import CountryTranslatorFrenchToEnglish


class CaitProcessor:

    def __init__(self):
        self.list_gases = ['Total CH4 (MtCO2e)', 'Total CH4 (including LUCF) (MtCO2e)',
                           'Total CO2 (excluding LUCF) (MtCO2)', 'Total CO2 (including LUCF) (MtCO2)',
                           'Total N2O (MtCO2e)', 'Total N2O (including LUCF) (MtCO2e)',
                           'Total F-Gas (MtCO2e)']

        self.list_sectors = ['Other Fuel Combustion (MtCO2e)', 'Fugitive Emissions (MtCO2e)', 'Energy (MtCO2e)', 'Electricity/Heat (MtCO2)',
                             'Waste (MtCO2e)', 'Bunker Fuels (MtCO2)', 'Agriculture (MtCO2e)', 'Manufacturing/Construction (MtCO2)',
                             'LUCF (MtCO2)', 'Transportation (MtCO2)', 'Industrial Processes (MtCO2e)']

        self.gases_including_lucf = {
            'Total CH4 (MtCO2e)': False,
            'Total CH4 (including LUCF) (MtCO2e)': True,
            'Total CO2 (excluding LUCF) (MtCO2)': False,
            'Total CO2 (including LUCF) (MtCO2)': True,
            'Total N2O (MtCO2e)': False,
            'Total N2O (including LUCF) (MtCO2e)': True,
            'Total F-Gas (MtCO2e)': False
        }

        self.gases_new_name = {
            'Total CH4 (MtCO2e)': "CH4",
            'Total CH4 (including LUCF) (MtCO2e)': "CH4",
            'Total CO2 (excluding LUCF) (MtCO2)': "CO2",
            'Total CO2 (including LUCF) (MtCO2)': "CO2",
            'Total N2O (MtCO2e)': "N2O",
            'Total N2O (including LUCF) (MtCO2e)': "N2O",
            'Total F-Gas (MtCO2e)': "F-Gases"
        }

    def compute_total_gas_per_country(self, df_calt: pd.DataFrame):
        """

        :param df_calt:
        :return:
        """
        # compute and melt for each gas.
        print("\n----- Clean CAIT dataset")
        list_df_gas_melted_gas = []
        for gas in self.list_gases:
            df_calt_gas = df_calt[["country", "year", gas]]
            df_calt_gas = df_calt_gas.rename({gas: "ghg"}, axis=1)
            df_calt_gas["gas"] = self.gases_new_name[gas]
            df_calt_gas["including_lucf"] = self.gases_including_lucf[gas]
            list_df_gas_melted_gas.append(df_calt_gas.copy(deep=True))
            if gas == 'Total F-Gas (MtCO2e)':  # For F-Gas we only have 1 line so we duplicate it for including and excluding lucf
                df_calt_gas_with_lucf = df_calt_gas.copy(deep=True)
                df_calt_gas_with_lucf['including_lucf'] = True
                list_df_gas_melted_gas.append(df_calt_gas_with_lucf)
        df_gas_melted = pd.concat(list_df_gas_melted_gas, axis=0)

        return df_gas_melted

    def compute_total_co2eq_per_sector(self, df_calt: pd.DataFrame):
        """

        :param df_calt:
        :return:
        """
        # compute and melt for each sector.
        list_df_gas_melted_sector = []
        for sector in self.list_sectors:
            df_calt_sector = df_calt[["country", "year", sector]]
            df_calt_sector = df_calt_sector.rename({sector: "ghg"}, axis=1)
            df_calt_sector["sector"] = sector.split(" (MtCO2")[0]
            list_df_gas_melted_sector.append(df_calt_sector.copy(deep=True))
        df_sector_melted = pd.concat(list_df_gas_melted_sector, axis=0)

        return df_sector_melted

    @staticmethod
    def remove_energy_sector(df_calt):
        # Energy is already counted in the 5 subsectors : Electricity/Heat, Manufacturing/Construction, ...
        # To avoid double accounting we exclude it
        # see : https://sites.google.com/site/climateanalysisindicatorstool/cait-international-8-0/sector-definitions
        return df_calt[df_calt["sector"] != "Energy"]

    @staticmethod
    def remove_lucf_sector(df_calt):
        # Remove LUCF sector because values can be negative and we don't have a solution at the moment to visualize it
        return df_calt[df_calt["sector"] != "LUCF"]

    def compute_cait_data_stacked_sector(self, df_cait_group_by_sector, df_cait_prepared):
        """

        :param df_cait_group_by:
        :param df_cait_prepared:
        :return:
        """
        list_cols_to_select = ["group_type", "group_name", "year", "sector", "ghg", "ghg_unit"]
        df_cait_group_by_sector_not_world = df_cait_group_by_sector[df_cait_group_by_sector["group_name"] != "World"]
        df_cait_group_by_sector_not_world = df_cait_group_by_sector_not_world[list_cols_to_select]

        # compute statistics per country
        df_cait_prepared_not_world = df_cait_prepared[(df_cait_prepared["sector"].notnull()) & (df_cait_prepared["country"] != "World")]
        df_cait_prepared_not_world["group_type"] = 'country'
        df_cait_prepared_not_world = df_cait_prepared_not_world.rename({"country": "group_name"}, axis=1)
        df_cait_prepared_not_world = df_cait_prepared_not_world[list_cols_to_select]

        # compute statistics per zone
        df_cait_prepared_world = df_cait_prepared[(df_cait_prepared["sector"].notnull()) & (df_cait_prepared["country"] == "World")]
        df_cait_prepared_world["group_type"] = 'zone'
        df_cait_prepared_world = df_cait_prepared_world.rename({"country": "group_name"}, axis=1)
        df_cait_prepared_world = df_cait_prepared_world[list_cols_to_select]

        return pd.concat([df_cait_group_by_sector_not_world, df_cait_prepared_not_world, df_cait_prepared_world], axis=0)

    @staticmethod
    def compute_cait_data_stacked_gas(df_cait_group_by_country, df_cait_prepared):
        """

        :param df_cait_group_by_country:
        :param df_cait_prepared:
        :return:
        """
        list_cols_to_select = ["group_type", "group_name", "year", "including_lucf", "gas", "ghg", "ghg_unit"]
        df_cait_group_by_gas_not_world = df_cait_group_by_country[df_cait_group_by_country["group_name"] != "World"]
        df_cait_group_by_gas_not_world = df_cait_group_by_gas_not_world[list_cols_to_select]

        # compute statistics per country
        df_cait_prepared_not_world = df_cait_prepared[(df_cait_prepared["gas"].notnull()) & (df_cait_prepared["country"] != "World") & (df_cait_prepared["gas"].notnull())]
        df_cait_prepared_not_world["group_type"] = 'country'
        df_cait_prepared_not_world = df_cait_prepared_not_world.rename({"country": "group_name"}, axis=1)
        df_cait_prepared_not_world = df_cait_prepared_not_world[list_cols_to_select]

        # compute statistics per zone
        df_cait_prepared_world = df_cait_prepared[(df_cait_prepared["country"].notnull()) & (df_cait_prepared["country"] == "World") & (df_cait_prepared["gas"].notnull())]
        df_cait_prepared_world["group_type"] = 'zone'
        df_cait_prepared_world = df_cait_prepared_world.rename({"country": "group_name"}, axis=1)
        df_cait_prepared_world = df_cait_prepared_world[list_cols_to_select]

        return pd.concat([df_cait_group_by_gas_not_world, df_cait_prepared_not_world, df_cait_prepared_world], axis=0)


    def run(self, df_cait: pd.DataFrame, df_country: pd.DataFrame):

        # clean dataframe
        print("\n----- Clean CAIT dataset")
        df_cait = df_cait.rename({"Country": "country", "Year": "year"}, axis=1)
        df_cait["country"] = CountryTranslatorFrenchToEnglish().run(df_cait["country"], raise_errors=False)
        df_cait["country"] = df_cait["country"].fillna("World")  # TODO - gérer proprement ce cas dans trasnlation.py car dette technique (10/06)
        df_cait_total_per_gas = self.compute_total_gas_per_country(df_cait)
        df_cait_total_per_sector = self.compute_total_co2eq_per_sector(df_cait)
        df_cait_prepared = pd.concat([df_cait_total_per_gas, df_cait_total_per_sector], axis=0)
        df_cait_prepared = self.remove_energy_sector(df_cait_prepared)
        df_cait_prepared = self.remove_lucf_sector(df_cait_prepared)
        df_cait_prepared["ghg_unit"] = "MtCO2eq"

        # merge CAIT with countries
        df_cait_and_countries = df_country.merge(df_cait_prepared, how="left", left_on="country", right_on="country")

        # compute total CAIT per sector
        df_cait_group_by_sector = df_cait_and_countries[df_cait_and_countries["sector"].notnull()]
        df_cait_group_by_sector = df_cait_group_by_sector.groupby(["group_type", "group_name", "year", "sector"])
        df_cait_group_by_sector = df_cait_group_by_sector.agg(ghg=('ghg', 'sum'), ghg_unit=("ghg_unit", "first"))
        df_cait_group_by_sector = df_cait_group_by_sector.reset_index()

        # compute total CAIT per country
        df_cait_group_by_country = df_cait_and_countries[df_cait_and_countries["sector"].isnull()]
        df_cait_group_by_country = df_cait_group_by_country.groupby(["group_type", "group_name", "year", "including_lucf", "gas"])
        df_cait_group_by_country = df_cait_group_by_country.agg(ghg=('ghg', 'sum'), ghg_unit=("ghg_unit", "first"))
        df_cait_group_by_country = df_cait_group_by_country.reset_index()

        # compute CAIT stacked  # TODO - code smell, code trop complexe à refactorer
        df_cait_sector_stacked = self.compute_cait_data_stacked_sector(df_cait_group_by_sector, df_cait_prepared)
        df_cait_gas_stacked = self.compute_cait_data_stacked_gas(df_cait_group_by_country, df_cait_prepared)

        return df_cait_sector_stacked, df_cait_gas_stacked