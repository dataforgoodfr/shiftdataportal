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
data = pd.read_csv(PATH_ELECTRICITY_DATA, skiprows=1)

# Importing the country groups table
countries = pd.read_csv(PATH_COUNTRIES)


############ Data Transformation ############

### Energy Type
data = get_energy_type(data)

### Pivoting table
data = pivot_dates(data)

### Country Translation
data['country'] = CountryTranslatorFrenchToEnglish().run(serie_country_to_translate=data['country'], 
                                                         raise_errors=True)

# Adding groups to dataset
data = GroupMaker(data, countries)

# Adding the context columns
data['source'] = 'US EIA'
data['unit'] = 'GW'

# Dataframe ordering
data = data[["source", "group_type", "country", "year", "energy_family", "power", "unit"]]
data = data.rename(columns={"country" : "group_name"})

# Formating the dataset
data = StatisticsDataframeFormatter.select_and_sort_values(df=data, 
                                                           col_statistics='power')

#####################################
###### Testing and data export ######
#####################################

# Testing for missing values
assert data.isna().sum().sum() == 0, "Missing values are present in the final dataset." 

# Exporting to csv
data.to_csv(EXPORT_PATH, index=False)