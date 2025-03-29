import pandas as pd
from utils.translation import CountryTranslatorFrenchToEnglish
from utils.format import StatisticsDataframeFormatter
from transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
from eia import get_data
import os


#### Program Execution ####

if __name__ == "__main__":

    electricity_capacity_infos = {"url":"https://api.eia.gov/v2/international/data/?frequency=annual&api_key=APIKEY&data[0]=value&facets[activityId][]=7&facets[productId][]=27&facets[productId][]=28&facets[productId][]=33&facets[productId][]=35&facets[productId][]=36&facets[productId][]=37&facets[productId][]=38&facets[productId][]=82&facets[countryRegionId][]=countrycode&facets[unit][]=MK&start=1949&end=2024&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000",
                                  "unit":"GW",
                                  "export_file":"WORLD_ENERGY_HISTORY_electricity_capacity_prod.csv"}
    
    electricity_generation_infos = {"url":"https://api.eia.gov/v2/international/data/?frequency=annual&api_key=APIKEY&data[0]=value&facets[activityId][]=12&facets[productId][]=27&facets[productId][]=28&facets[productId][]=33&facets[productId][]=35&facets[productId][]=36&facets[productId][]=37&facets[productId][]=38&facets[productId][]=82&facets[countryRegionId][]=countrycode&facets[unit][]=BKWH&start=1949&end=2024&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=10000",
                                  "unit":"TW",
                                  "export_file":"WORLD_ENERGY_HISTORY_electricity_generation_prod.csv"}

    

    #### Requesting the API ####
    for elem in [electricity_capacity_infos, electricity_generation_infos]:

        ### Requesting the API
        df_elec = get_data(elem['url'])
        df_elec = df_elec.dropna()
        

        # Reorganizing
        df_elec['year'] = df_elec['year'].astype(int)
        df_elec[['country', 'year', 'energy_family', 'power']]
        df_elec['power'] = df_elec['power'].astype(float)

        # Translating countries
        df_elec['country'] = df_elec['country'].str.strip()
        df_elec['country'] = CountryTranslatorFrenchToEnglish().run(df_elec['country'], raise_errors=True)

        #Building paths
        current_dir = os.path.dirname(os.path.realpath(__file__))
        path_countries = os.path.join(current_dir, "../../data/raw/demographics/country_groups.csv")
        df_country = pd.read_csv(path_countries)

        # Adding groups to the table
        list_col_group_by = ['group_type', 'group_name', 'energy_family', 'year']
        dict_agg = {"power": "sum"}
        df_elec = StatisticsPerCountriesAndZonesJoiner().run(df_elec, df_country, list_col_group_by, dict_agg)

        # Adding the context columns
        df_elec['source'] = 'US EIA'
        df_elec['power_unit'] = elem['unit']

        # Dataframe ordering
        df_elec = df_elec[["source", 'group_type', 'group_name', "year", "energy_family", "power", "power_unit"]]

        # Dropping missing values
        df_elec = df_elec.dropna() 

        # Formating the dataset
        df_elec = StatisticsDataframeFormatter.select_and_sort_values(df=df_elec, 
                                                                      col_statistics='power')


        #### Exporting to csv ####
        df_elec.to_csv(os.path.join(current_dir, f"../../data/processed/electricity/{elem['export_file']}"), index=False)
