"""
Footprint versus territorial emissions
"""
import pandas as pd
from src.sdp_data.utils.translation import CountryTranslatorFrenchToEnglish
from src.sdp_data.transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner


class EoraCbaPerZoneAndCountryProcessor:

    def __init__(self):
        self.dict_translation_record_code_to_scope = {
            "PBA_GgCO2eqPerBnUSDGDP": "Territorial Emissions per GDP",
            "CBA_GgCO2eqPerBnUSDGDP": "Carbon Footprint per GDP",
            "PBA_GgCO2eq": "Territorial Emissions",
            "CBA_GgCO2eq": "Carbon Footprint",
            "PBA_tCO2eqperCap": "Territorial Emissions per Capita",
            "CBA_tCO2eqperCap": "Carbon Footprint per Capita"
        }
        self.dict_translation_record_code_to_co2_unit = {
            "PBA_GgCO2eqPerBnUSDGDP": "MtCO2 per Trillion $ GDP",
            "CBA_GgCO2eqPerBnUSDGDP": "MtCO2 per Trillion $ GDP",
            "PBA_GgCO2eq": "MtCO2",
            "CBA_GgCO2eq": "MtCO2",
            "PBA_tCO2eqperCap": "tCO2 per capita",
            "CBA_tCO2eqperCap": "tCO2 per capita"
        }

    @staticmethod
    def melt_years(df: pd.DataFrame):
        return pd.melt(df, id_vars=["country", "record_code"], var_name='year', value_name='co2')

    @staticmethod
    def convert_giga_units(df_eora_cba):
        df_eora_cba.loc[df_eora_cba["record_code"].str.contains("Gg"), "co2"] /= 1000
        return df_eora_cba

    def compute_scope_from_record_code(self, df_eora_cba):  # TODO - ajouter un test de raise Value error
        df_eora_cba["scope"] = df_eora_cba["record_code"].replace(self.dict_translation_record_code_to_scope)
        return df_eora_cba

    def compute_co2_unit_from_record_code(self, df_eora_cba):
        df_eora_cba["co2_unit"] = df_eora_cba["record_code"].replace(self.dict_translation_record_code_to_co2_unit)
        return df_eora_cba

    def run(self, df_eora_cba: pd.DataFrame, df_country: pd.DataFrame):
        """
        Computes the EORA CBA statistics for each country and zone.
        :param df_eora_cba: (dataframe) containing columns country + Record + years starting from 1970. Values are EORA CBA.
        :param df_country: (dataframe) containing columns group_type, group_name and country.
        :return: (dataframe) containing the EORA CBA fo each country and for each zone. Contains columns
            group_type, group_name, year, scope, co2_unit, source and co2.
        """
        # clean and filter countries
        print("\n----- compute EORA CBA for each country and each zone")
        df_eora_cba = df_eora_cba.rename({"Country": "country", "Record": "record_code"}, axis=1)
        # df_eora_cba = df_eora_cba[df_eora_cba["country"] != "Former USSR"]  # TODO - vérifier avec la team que faire de l'URSS.
        df_eora_cba["country"] = CountryTranslatorFrenchToEnglish().run(df_eora_cba["country"], raise_errors=False)
        df_eora_cba = df_eora_cba.dropna(subset=["country"])

        # melt the years so to get resulting columns country, record_code, year and co2
        df_eora_cba = self.melt_years(df_eora_cba)
        df_eora_cba["year"] = pd.to_numeric(df_eora_cba["year"], errors="coerce")
        df_eora_cba = df_eora_cba.dropna(subset=["year"])
        df_eora_cba["year"] = df_eora_cba["year"].astype(int).astype(str)

        # create new columns scope, co2_unit and Source
        df_eora_cba = self.convert_giga_units(df_eora_cba)
        df_eora_cba = self.compute_scope_from_record_code(df_eora_cba)
        df_eora_cba["scope"] = df_eora_cba["scope"].str.replace('Carbon Footprint', 'CO2 Footprint')
        df_eora_cba = self.compute_co2_unit_from_record_code(df_eora_cba)
        df_eora_cba["source"] = "Eora"

        # filter on sectors of interest
        list_scope_to_filter = ["Territorial Emissions", "CO2 Footprint"]
        df_eora_cba = df_eora_cba[df_eora_cba["scope"].isin(list_scope_to_filter)]
        
        # join with countries
        list_cols_group_by = ['group_type', 'group_name', 'year', 'scope', 'co2_unit', 'source']
        dict_agg = {'co2': "sum"}
        df_eora_cba_per_zone_and_countries = StatisticsPerCountriesAndZonesJoiner().run(df_eora_cba, df_country, list_cols_group_by, dict_agg)

        return df_eora_cba_per_zone_and_countries


class GcbPerZoneAndCountryProcessor:

    @staticmethod
    def transpose_and_unstack_gcb(df_years_and_countries: pd.DataFrame):
        df_years_and_countries = df_years_and_countries.set_index("year").transpose()
        df_unstacked = df_years_and_countries.unstack().reset_index()
        df_unstacked.columns = ["year", "country", "co2"]
        return df_unstacked

    def run(self, df_gcb_territorial: pd.DataFrame, df_gcb_cba: pd.DataFrame, df_country: pd.DataFrame):
        """
        Computes the GCB statistics for each country and zone.
        :param df_gcb_territorial: (dataframe) the Territorial GCB for each year (rows) and country (columns).
        :param df_gcb_cba: (dataframe) the Territorial GCB-CBA for each year (row) and country (column).
        :param df_country: (dataframe) containing each countries and zones
        :return:
        """
        # transpose, unstack years and prepare concatenate df_gcb_territorial + df_gcb_cba
        print("\n----- compute GCB Territorial for each country and each zone")
        df_gcb_territorial = self.transpose_and_unstack_gcb(df_gcb_territorial)
        df_gcb_territorial["scope"] = "Territorial Emissions"
        df_gcb_cba = self.transpose_and_unstack_gcb(df_gcb_cba)
        df_gcb_cba["scope"] = "Carbon Footprint"
        df_gcb_stacked = pd.concat([df_gcb_territorial, df_gcb_cba], axis=0)

        # clean dataframe and translate countries
        df_gcb_stacked["country"] = CountryTranslatorFrenchToEnglish().run(df_gcb_stacked["country"], raise_errors=False)
        df_gcb_stacked = df_gcb_stacked[df_gcb_stacked["country"] != "Delete"]  # TODO - vérifier avec la team que faire de Delete.
        df_gcb_stacked = df_gcb_stacked.dropna(subset=["country", "co2"])

        # filter time
        df_gcb_stacked["year"] = pd.to_numeric(df_gcb_stacked["year"], errors="coerce")
        df_gcb_stacked = df_gcb_stacked.dropna(subset=["year"])
        df_gcb_stacked["year"] = df_gcb_stacked["year"].astype(str)
        df_gcb_stacked = df_gcb_stacked[df_gcb_stacked["year"] >= "1990"]

        # create new columns scope, co2_unit and Source
        df_gcb_stacked["co2"] *= 3.664
        df_gcb_stacked["co2_unit"] = "MtCO2"
        df_gcb_stacked["source"] = "Global Carbon Budget"
        df_gcb_stacked["scope"] = df_gcb_stacked["scope"].str.replace('Carbon Footprint', 'CO2 Footprint')

        # join with countries
        list_cols_group_by = ['group_type', 'group_name', 'year', 'scope', 'co2_unit', 'source']
        dict_agg = {'co2': "sum"}
        df_gcb_per_zone_and_countries = StatisticsPerCountriesAndZonesJoiner().run(df_gcb_stacked, df_country, list_cols_group_by, dict_agg)

        return df_gcb_per_zone_and_countries


class FootprintVsTerrotorialProcessor:

    @staticmethod
    def run(df_gcb_territorial: pd.DataFrame, df_gcb_cba: pd.DataFrame, df_eora_cba: pd.DataFrame,
            df_country: pd.DataFrame):
        """
        Computes the footprint versus territorial statistics. The final dataset computes for each countries and zone
            - the Territorial emissions.
            - the Carbon footprint.
        :param df_gcb_territorial: (dataframe) the Territorial GCB for each year (rows) and country (columns).
        :param df_gcb_cba: (dataframe) the Territorial GCB-CBA for each year (row) and country (column).
        :param df_eora_cba: (dataframe) containing columns country + Record + years starting from 1970. Values are EORA CBA.
        :param df_country: (dataframe) containing columns group_type, group_name and country.
        :return:
        """
        # compute the EORA CBA per zones and countries
        print("\n----- compute footprint vs. territorial emissions")
        df_eora_cba_per_zone_and_countries = EoraCbaPerZoneAndCountryProcessor().run(df_eora_cba, df_country)

        # compute the GCB per zones and countries
        df_gcb_per_zone_and_countries = GcbPerZoneAndCountryProcessor().run(df_gcb_territorial, df_gcb_cba, df_country)

        # stack the two datasets together
        df_footprint_vs_territorial = pd.concat([df_eora_cba_per_zone_and_countries, df_gcb_per_zone_and_countries], axis=0)
        df_footprint_vs_territorial = df_footprint_vs_territorial.sort_values(by=["group_type", "group_name", "year", "scope"])

        # format and return
        list_cols_group_by = ['group_type', 'group_name', 'year', 'scope', 'co2_unit', 'source']
        df_footprint_vs_territorial = df_footprint_vs_territorial.sort_values(list_cols_group_by)
        df_footprint_vs_territorial = df_footprint_vs_territorial[list_cols_group_by + ["co2"]]

        return df_footprint_vs_territorial
