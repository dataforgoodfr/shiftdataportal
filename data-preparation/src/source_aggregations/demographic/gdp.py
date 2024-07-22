import pandas as pd
from src.source_aggregations.demographic.countries import \
    StatisticsPerCountriesAndZonesJoiner
from src.utils.iso3166 import countries_by_alpha3
from src.utils.translation import CountryTranslatorFrenchToEnglish


class GdpMaddissonPerZoneAndCountryProcessor:

    def __init__(self, year_min=1950):
        self.countries_by_alpha3 = countries_by_alpha3
        self.countries_by_alpha3 = {k: v.name for k, v in self.countries_by_alpha3.items()}
        self.year_min = year_min

    def translate_country_code_to_country_name(self, serie_country_code_to_translate: pd.Series, raise_errors: bool):
        serie_country_translated = serie_country_code_to_translate.map(self.countries_by_alpha3)
        countries_no_translating = list(set(serie_country_code_to_translate[serie_country_translated.isnull()].values.tolist()))
        if serie_country_code_to_translate.isnull().sum() > 0:
            print("WARN : no translating found for countries %s. Please add it in iso3166.py" % countries_no_translating)
            if raise_errors:
                raise ValueError("ERROR : no translating found for countries %s" % countries_no_translating)

        return serie_country_translated


    def run(self, df_gdp_maddison, df_country):
        """
        Computes the GDP (Maddison) per year for each country and zone.
        :param df_gdp_maddison: (dataframe) containing the GDP (Maddison)
        :param df_country: (dataframe) containing countries and zones.
        :return: df_gdp_per_zone_and_countries (Maddison)
        """
        # convert countries names
        df_gdp_maddison = df_gdp_maddison[~df_gdp_maddison["country"].isin(["Former USSR", "Former Yugoslavia", "Czechoslovakia"])] # TODO - fixer l'union soviétique t autres pays ?
        df_gdp_maddison["country"] = CountryTranslatorFrenchToEnglish().run(df_gdp_maddison["country"], raise_errors=False)

        # compute gdp from gdp per capita
        df_gdp_maddison["population"] = df_gdp_maddison["pop"] * 1000
        df_gdp_maddison["gdp"] = df_gdp_maddison["gdppc"] * df_gdp_maddison["population"]
        df_gdp_maddison = df_gdp_maddison[df_gdp_maddison["gdp"].notnull()]
        df_gdp_maddison["gdp_unit"] = "GDP (constant 2011 US$)"
        df_gdp_maddison["year"] = pd.to_numeric(df_gdp_maddison["year"])
        df_gdp_maddison = df_gdp_maddison[df_gdp_maddison["year"] >= self.year_min]

        # join with countries
        list_cols_group_by = ['group_type', 'group_name', 'year', 'gdp_unit']
        dict_aggregation = {'gdp': 'sum'}
        df_gdp_per_zone_and_countries = StatisticsPerCountriesAndZonesJoiner().run(df_gdp_maddison, df_country, list_cols_group_by, dict_aggregation)
        df_gdp_per_zone_and_countries = df_gdp_per_zone_and_countries.sort_values(by=list_cols_group_by)
        df_gdp_per_zone_and_countries = df_gdp_per_zone_and_countries[list_cols_group_by + ["gdp"]]

        return df_gdp_per_zone_and_countries


class GdpWorldBankPerZoneAndCountryProcessor:

    def __init__(self, year_min=1950):
        self.year_min = year_min
        self.country_codes_to_drop = ['ARB', 'CEB', 'CSS', 'EAP', 'EAR', 'EAS', 'ECA', 'ECS', 'EMU', 'EUU', 'FCS', 'HIC',
                                      'HPC', 'IBD', 'IBT', 'IDA', 'IDB', 'IDX', 'LAC', 'LCN', 'LDC', 'LIC', 'LMC', 'LMY',
                                      'LTE', 'MEA', 'MIC', 'MNA', 'NAC', 'OED', 'OSS', 'PRE', 'PSS', 'PST', 'SAS', 'SSA',
                                      'SSF', 'SST', 'TEA', 'TEC', 'TLA', 'TMN', 'TSA', 'TSS', 'UMC', 'WLD']

    @staticmethod
    def melt_years(df: pd.DataFrame):
        return pd.melt(df, id_vars=["country", "country_code", "gdp_unit", "indicator_code"],
                       var_name="year",
                       value_name="gdp")

    def run(self, df_gdp_worldbank, df_country):
        """
        Computes the GDP (World Bank) per year for each country and zone.
        :param df_gdp_worldbank: (dataframe) containing the GDP (World Bank)
        :param df_country: (dataframe) containing countries and zones.
        :return: df_gdp_per_zone_and_countries (World Bank)
        """
        # rename columns and clean countries
        df_gdp_worldbank = df_gdp_worldbank[~(df_gdp_worldbank['country_code_a3'].isin(self.country_codes_to_drop))]
        df_gdp_worldbank.rename({"country_name": "country"}, axis="columns", inplace=True)
        df_gdp_worldbank["country"] = CountryTranslatorFrenchToEnglish().run(df_gdp_worldbank["country"], raise_errors=False)
        df_gdp_worldbank = df_gdp_worldbank.dropna(subset=["country"])

        # Filter years, empty gdp values, and drop unused columns
        df_gdp_worldbank = self.melt_years(df_gdp_worldbank)
        df_gdp_worldbank["year"] = pd.to_numeric(df_gdp_worldbank["year"])
        df_gdp_worldbank = df_gdp_worldbank[(df_gdp_worldbank["year"] >= self.year_min) & (df_gdp_worldbank["gdp"].notnull())]
        df_gdp_worldbank = df_gdp_worldbank[["country", "gdp_unit", "year", "gdp"]]

        # join with countries
        list_cols_group_by = ['group_type', 'group_name', 'year', 'gdp_unit']
        dict_aggregation = {'gdp': 'sum'}
        df_gdp_per_zone_and_countries = StatisticsPerCountriesAndZonesJoiner().run(df_gdp_worldbank, df_country, list_cols_group_by, dict_aggregation)
        df_gdp_per_zone_and_countries = df_gdp_per_zone_and_countries.sort_values(by=list_cols_group_by)
        df_gdp_per_zone_and_countries = df_gdp_per_zone_and_countries[list_cols_group_by + ["gdp"]]
        df_gdp_per_zone_and_countries = df_gdp_per_zone_and_countries[(df_gdp_per_zone_and_countries["group_type"] == "country") | (df_gdp_per_zone_and_countries["year"] >= 1990)]

        return df_gdp_per_zone_and_countries
