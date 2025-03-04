############################
###### Initialisation ######
############################

import pandas as pd
import numpy as np
import re
from utils.utils import CountryTranslatorFrenchToEnglish
from utils.format import StatisticsDataframeFormatter
from transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
import os



PROD_RELATIVE_PATH = "../../data/raw/primary_energy_production"
ENERGY_SOURCES = ["Oil", "Gas","Coal","Nuclear","Solar, Tide, Wave Fuel Cell","Biomass and Waste","Geothermal","Wind","Hydroelectricity","Fuel Ethanol","Biodiesel"]
ENERGY_SOURCES.sort()


#Conversion rates 
RATE_QUAD_TO_MTOE = 25.2
RATE_MBD_TO_MTOE = 51.1 



## get all csv file names 
def find_csv_filenames( path_to_dir : str ) -> list:
    suffix = ".csv"
    filenames = os.listdir(path_to_dir)
    return [ os.path.join(path_to_dir, filename) for filename in filenames if filename.endswith( suffix ) ]

def transform_new_data(data : pd.DataFrame , energy_family : str):
    
    #### get the unit for the energy_family
    energy = data["Unnamed: 1"].iloc[0]
    unit = re.search(r"\((.*?)\)", energy).group(1) if re.search(r"\((.*?)\)", energy) else ""

    if unit == "Mb/d":
        print(energy_family)

    #### setting the energy_family and unit columns
    data["energy_family"] = energy_family
    data["energy_unit"] = "Mtoe" if unit == "MMTOE" else unit 

    ### setting the country column 
    data["country"] = np.where(data["Unnamed: 1"].str.contains(unit),np.NaN,data["Unnamed: 1"])
    data.country = data.country.str.lstrip()
    data = data.drop(index=data.index[0])
    data = data.drop(columns=["Unnamed: 1","API"])
    return data


def rearrange_data(data : pd.DataFrame):
    data = data.melt(id_vars=["energy_family","country","energy_unit"],var_name='year',value_name="energy")
    data["year"] = data["year"].apply(int)
    return data

def cant_be_float(a):
    try:
        float(a)
        return False
    except ValueError:
        return True


if __name__ == "__main__": 
    translator = CountryTranslatorFrenchToEnglish() 
    stats = StatisticsPerCountriesAndZonesJoiner()

    current_dir = os.path.dirname(os.path.realpath(__file__))
    prod_path = os.path.join(current_dir, PROD_RELATIVE_PATH)
    path_countries = os.path.join(current_dir, "../../data/raw/demographics/country_groups.csv")

    df_country = pd.read_csv(path_countries)


    csv_list = find_csv_filenames(prod_path)
    csv_list.sort()

    production_data_list = []
    for csv, energy_family in zip(csv_list,ENERGY_SOURCES):
        df = pd.read_csv(csv,skiprows=1)
        df  = transform_new_data(df, energy_family=energy_family)
        df = rearrange_data(df)
        production_data_list.append(df)

    production_eia = pd.concat(production_data_list, ignore_index=True)

    missing_production_eia = production_eia[(production_eia.energy.apply(cant_be_float)) | (production_eia.energy.isna())].copy()   
    available_production_eia = production_eia[~(production_eia.energy.apply(cant_be_float))].copy()
    available_production_eia =available_production_eia.dropna()
    available_production_eia.energy = available_production_eia.energy.apply(float)
    available_production_eia.country = translator.run(available_production_eia.country, raise_errors=True)

    ### Conversions
    available_production_eia.loc[available_production_eia.energy_unit == "Mb/d",["energy"]] = available_production_eia[available_production_eia.energy_unit == "Mb/d"].energy.apply(lambda x :x / RATE_MBD_TO_MTOE)
    available_production_eia.loc[available_production_eia.energy_unit == "quad Btu",["energy"]] = available_production_eia[available_production_eia.energy_unit == "quad Btu"].energy.apply(lambda x : x * RATE_QUAD_TO_MTOE)
    available_production_eia.energy_unit = "Mtoe"

    list_col_group_by = ['group_type', 'group_name', 'energy_family', 'year']
    dict_agg = {"energy": "sum"}
    available_production_eia = stats.run(available_production_eia,df_country=df_country,list_cols_group_by=list_col_group_by,dict_aggregation=dict_agg )