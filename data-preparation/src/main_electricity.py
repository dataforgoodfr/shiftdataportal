############################
###### Initialisation ######
############################

import pandas as pd
from utils.utils import get_energy_type, pivot_dates, CountryTranslatorFrenchToEnglish, GroupMaker
from utils.format import StatisticsDataframeFormatter
import os

PATH_MAIN = r'C:\Users\Cheri\Desktop\Data for Good\Shift Data Portal\sdp_git - Copie\shiftdataportal\data-preparation\src'
PATH_ELECTRICITY_DATA = r'C:\Users\Cheri\Desktop\Data for Good\Shift Data Portal\data\data_2023_qua.csv'
PATH_COUNTRIES = 'country_groups.csv'
EXPORT_PATH = r'C:\Users\Cheri\Desktop\Data for Good\Shift Data Portal\sdp_git - Copie\shiftdataportal\data-preparation\data\new_prod_data\WORLD_ENERGY_HISTORY_electricity_capacity_prod.csv'

os.chdir(PATH_MAIN)


######################################################
###### Chargement et Transformation des données ######
######################################################


### Data loading 
df_elec_capacity = pd.read_csv(PATH_ELECTRICITY_DATA, skiprows=1)

# Importing the country groups table
countries = pd.read_csv(PATH_COUNTRIES)


############ Data Transformation ############

### Energy Type
df_elec_capacity = get_energy_type(df_elec_capacity)

### Pivoting table
df_elec_capacity = pivot_dates(df_elec_capacity)

### Country Translation
df_elec_capacity['country'] = CountryTranslatorFrenchToEnglish().run(serie_country_to_translate=df_elec_capacity['country'], 
                                                         raise_errors=True)

# Adding groups to dataset
df_elec_capacity = GroupMaker(df_elec_capacity, countries)

# Adding the context columns
df_elec_capacity['source'] = 'US EIA'
df_elec_capacity['unit'] = 'GW'

# Dataframe ordering
df_elec_capacity = df_elec_capacity[["source", "group_type", "country", "year", "energy_family", "power", "unit"]]
df_elec_capacity = df_elec_capacity.rename(columns={"country" : "group_name"})

# Formating the dataset
df_elec_capacity = StatisticsDataframeFormatter.select_and_sort_values(df=df_elec_capacity, 
                                                           col_statistics='power')

#####################################
###### Testing and data export ######
#####################################

# Testing for missing values
assert df_elec_capacity.isna().sum().sum() == 0, "Missing values are present in the final dataset." 

# Exporting to csv
df_elec_capacity.to_csv(EXPORT_PATH, index=False)