import pandas as pd
from src.utils.iso3166 import countries_by_alpha3
from src.utils.translation import CountryTranslatorFrenchToEnglish


class EoraCo2TradePerZoneAndCountryProcessor:

    def __init__(self):
        self.countries_by_alpha3 = countries_by_alpha3
        self.countries_by_alpha3 = {k: v.name for k, v in self.countries_by_alpha3.items()}
        self.dict_sectors_to_replace = {"Finacial Intermediation and Business Activities": "Financial Intermediation and Business Activities"}

    def translate_country_code_to_country_name(self, serie_country_code_to_translate: pd.Series, raise_errors: bool):
        serie_country_translated = serie_country_code_to_translate.map(self.countries_by_alpha3)
        countries_no_translating = list(set(serie_country_code_to_translate[serie_country_translated.isnull()].values.tolist()))
        if serie_country_code_to_translate.isnull().sum() > 0:
            print("WARN : no translating found for countries %s. Please add it in iso3166.py" % countries_no_translating)
            if raise_errors:
                raise ValueError("ERROR : no translating found for countries %s" % countries_no_translating)

        return serie_country_translated

    @staticmethod
    def melt_countries(df: pd.DataFrame):
        return pd.melt(df, id_vars=["country_from", "sector"], var_name='country_to', value_name='ghg')

    @staticmethod
    def unstack_countries_in_dataframe(df: pd.DataFrame):
        df = df.unstack().reset_index()
        df.columns = ["country_to", "ghg", "country_from", "sector"]
        return df

    @staticmethod
    def compute_co2_exchanges_between_countries(df_eora_co2_trade):
        """
        Compute the CO2 exchanges between countries by taking into account both exports and imports.
        :param df_eora_co2_trade: (dataframe) containing the ghg for each pair of countries and sector.
        :return: df_trade_by_country: contains the sum of exchange between each pair of countries.
        """
        # TODO - re-vérifier le calcul des exchanges entre pays.
        # compute imports between countries
        df_exports = (df_eora_co2_trade
                      .groupby(['country_from', 'country_to', 'ghg_unit'])
                      .agg(co2=('ghg', 'sum')).reset_index()
                      )
        df_exports.loc[df_exports["country_from"] == df_exports["country_to"], "co2"] = 0.0
        df_exports = df_exports.rename({"country_from": "country", "ghg_unit": "co2_unit"}, axis=1)
        df_exports["type"] = "CO2 Exports"

        # compute exports between countries
        df_imports = (df_eora_co2_trade
                      .groupby(['country_to', 'country_from', 'ghg_unit'])
                      .agg(co2=('ghg', 'sum')).reset_index()
                      )
        df_imports.loc[df_imports["country_from"] == df_imports["country_to"], "co2"] = 0.0
        df_imports = df_imports.rename({"country_to": "country", "country_from": "country_to", "ghg_unit": "co2_unit"}, axis=1)
        df_imports["type"] = "CO2 Imports"

        df_trade_by_country = pd.concat([df_imports, df_exports], axis=0)

        return df_trade_by_country

    @staticmethod
    def add_and_filter_on_continents(df_trade_by_country: pd.DataFrame, df_country: pd.DataFrame):
        """
        For each country, add the zone and filter only on the continents.
        :param df_trade_by_country: (dataframe) containing the CO2 trade between each pair of countries.
        :param df_country: (dataframe) containing all the countries and their respective zones.
        :return: (dataframe) with zone added and filter on continent
        """
        df_zones = df_country[df_country["group_type"] == "zone"].set_index("country")
        df_trade_by_country = df_trade_by_country.merge(df_zones[["group_name"]], how="left", left_on="country_to", right_index=True)
        df_trade_by_country = df_trade_by_country.rename({"group_name": "continent_to"}, axis=1)
        list_continents = ["North America", "Central and South America", "Asia and Oceania", "Europe", "Africa"]
        df_trade_by_country = df_trade_by_country[df_trade_by_country["continent_to"].isin(list_continents)]
        return df_trade_by_country

    @staticmethod
    def compute_trade_by_sector(df_eora_co2_trade: pd.DataFrame):
        """
        For each country, compute the exports, imports and internal consumption of each sector.
        :param df_eora_co2_trade: (dataframe) containing the CO2 trade between each pair of countries.
        :return: (dataframe) with zone added and filter on continent
        """
        # compute exports per sector
        df_exports_sector = (df_eora_co2_trade[df_eora_co2_trade["country_from"] != df_eora_co2_trade["country_to"]]
                             .groupby(['country_from', 'sector', 'ghg_unit'])
                             .agg(co2=('ghg', 'sum')).reset_index()
                             )
        df_exports_sector = df_exports_sector.rename({"country_from": "country", "ghg_unit": "co2_unit"}, axis=1)
        df_exports_sector["type"] = "CO2 Exports"

        # compute imports per sector
        df_imports_sector = (df_eora_co2_trade[df_eora_co2_trade["country_from"] != df_eora_co2_trade["country_to"]]
                             .groupby(['country_to', 'sector', 'ghg_unit'])
                             .agg(co2=('ghg', 'sum')).reset_index()
                             )
        df_imports_sector = df_imports_sector.rename({"country_to": "country", "ghg_unit": "co2_unit"}, axis=1)
        df_imports_sector["type"] = "CO2 Imports"

        # compute territorial consumption per sector
        df_territorial_sector = (df_eora_co2_trade[df_eora_co2_trade["country_from"] == df_eora_co2_trade["country_to"]]
                                 .groupby(['country_to', 'sector', 'ghg_unit'])
                                 .agg(co2=('ghg', 'sum')).reset_index()
                                 )
        df_territorial_sector = df_territorial_sector.rename({"country_to": "country", "ghg_unit": "co2_unit"}, axis=1)
        df_territorial_sector["type"] = "Territorial CO2 emissions"

        # concatenate
        df_trade_by_sector = pd.concat([df_exports_sector, df_imports_sector, df_territorial_sector], axis=0)

        return df_trade_by_sector


    def run(self, df_eora_co2_trade: pd.DataFrame, df_country: pd.DataFrame):
        """
        Computes the total exchanges between each pair of countries (df_trade_by_country) and the total exchange between
        each sector and each country (df_trade_by_sector).
        :param df_eora_co2_trade: (dataframe) containing the COE trade exchange between each pair of countries.
        :param df_country: (dataframe) containing all countries and associated zones.
        :return:
        """
        # translate the countries codes (index and columns) into countries names.
        df_eora_co2_trade = df_eora_co2_trade.rename({"country": "country_from"}, axis=1)
        df_eora_co2_trade = df_eora_co2_trade.drop("ROW", axis=1)
        df_eora_co2_trade["sector"] = df_eora_co2_trade["sector"].replace(self.dict_sectors_to_replace)
        df_eora_co2_trade["country_from"] = self.translate_country_code_to_country_name(df_eora_co2_trade["country_from"], raise_errors=True)
        df_eora_co2_trade["country_from"] = CountryTranslatorFrenchToEnglish().run(df_eora_co2_trade["country_from"], raise_errors=False)  # TODO - passer en raise_errors True
        df_eora_co2_trade = df_eora_co2_trade.set_index(["country_from", "sector"])
        df_eora_co2_trade.columns = self.translate_country_code_to_country_name(df_eora_co2_trade.columns, raise_errors=True)
        df_eora_co2_trade.columns = CountryTranslatorFrenchToEnglish().run(df_eora_co2_trade.columns, raise_errors=False)  # TODO - passer en raise_errors True
        df_eora_co2_trade = df_eora_co2_trade.reset_index()

        # compute all the exchanges for all pairs of (country_from, sector -> country_to)
        df_eora_co2_trade = self.melt_countries(df_eora_co2_trade)
        df_eora_co2_trade["ghg_unit"] = "MtCO2e"
        df_eora_co2_trade = df_eora_co2_trade[['country_from', 'country_to', 'sector', 'ghg', 'ghg_unit']]

        # compute trade of CO2 between countries and filter on continents.
        df_trade_by_country = self.compute_co2_exchanges_between_countries(df_eora_co2_trade)
        df_trade_by_country = self.add_and_filter_on_continents(df_trade_by_country, df_country)

        # compute trade per sector
        df_trade_by_sector = self.compute_trade_by_sector(df_eora_co2_trade)
        df_trade_by_sector["group_type"] = "country"
        df_trade_by_sector = df_trade_by_sector.rename({"country": "group_name"}, axis=1)  # TODO - à vérifier par rapport ax dernier ajouts de Theo.

        return df_trade_by_country, df_trade_by_sector
