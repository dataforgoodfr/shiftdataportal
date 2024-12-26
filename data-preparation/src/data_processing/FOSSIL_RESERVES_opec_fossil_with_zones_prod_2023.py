#Fichier Python permettant de générer :
#__FOSSIL_RESERVES_bp_fossil_with_zones_prod.csv__#

import pandas as pd
import numpy as np
from utils.translation import CountryTranslatorFrenchToEnglish
from transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
from utils.format import StatisticsDataframeFormatter

# Charger donnée "country_groups.csv"

# Charger données OPEC -> pas API disponible
# site source Maj annuelle : https://publications.opec.org/asb

class OpecFossilProvenReservesCleaner:
    def __init__(self) :
        pass
    
    def rename_column(self, df) :
        return df.rename(columns={'Unnamed: 0': 'country'})
    
    def drop_unnecessary_lines(self, df) :
        """
        Drop footnotes not necessary for data processing
        """
        df.set_index('country', inplace=True)
        df = df.loc[:"Total World", :]
        df.drop(['Africa', 'Latin America', 'Other Asia', 'Other Eurasia', 'Middle East', 'OECD Europe', 'OECD Asia Pacific', 'OECD Americas', 'Others', 'Other Europe', 'Total World'], axis = 0, inplace = True)
        return df
    
    def mb_to_gb_scale(self, df) :
        df = df.apply(lambda x: round(pd.to_numeric(x, errors='coerce') / 1000, 3))
        return df
    
    def translate_country(self, df) :
        df = df.reset_index()
        df["country"] = CountryTranslatorFrenchToEnglish().run(df["country"], raise_errors=False)
        return df

    def column_to_line(self, df) :
        df = pd.melt(df,
                     id_vars = "country",
                     var_name = "year",
                     value_name = "proven_reserves")
        df.dropna(inplace = True)
        return df
    
    def stat_per_countries_zones_join(self, df, country) :
        list_col_group_by = ['group_type', 'group_name', 'year']
        dict_agg = {"proven_reserves" : "sum"}
        df = StatisticsPerCountriesAndZonesJoiner().run(df, country, list_col_group_by, dict_agg)
        return df
    
    def stat_df_formatter(self, df) :
        col_statistics = "proven_reserves"
        df = StatisticsDataframeFormatter().select_and_sort_values(df, col_statistics)
        df["energy_source"] = "Oil"
        df["proven_reserves_unit"] = "Gb"
        df = df[["group_type", "group_name", "energy_source", "year", "proven_reserves", "proven_reserves_unit"]]
        return df  
            
    def clean_data(self, df, country):
        df = self.rename_column(df)
        df = self.drop_unnecessary_lines(df)
        df = self.mb_to_gb_scale(df)
        df = self.translate_country(df)
        df = self.column_to_line(df)
        df = self.stat_per_countries_zones_join(df, country)
        df = self.stat_df_formatter(df)
        return df
    
# Application class
cleaner = OpecFossilProvenReservesCleaner()
df_new = cleaner.clean_data(df, country)
df_new