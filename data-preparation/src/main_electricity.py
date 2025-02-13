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



###############################################
################## Fonctions ##################
###############################################


def get_energy_type(table: pd.core.frame.DataFrame) -> pd.DataFrame:
    """Cette fonction affecte le type d'énergie correspondant à la ligne.
    
    Paramètres:
        table: Table exportée du site de l'EIA (triée par source d'énergie/activité).

    Sortie:
        Renvoie la table d'entrée dotée de la colonne 'energy_family'."""


    # Création de la colonne 'energy_family'
    table['energy_family'] = np.where(table['country'].str.contains('electricity'), table['country'], np.NaN)

    # Affectation du type d'énergie pour chaque ligne
    table['energy_family'] = table['energy_family'].ffill()

    # Récupération du type d'énergie
    table['energy_family'] = table['energy_family'].apply(lambda text: re.findall("(.*)electricity", text).pop())

    # Retrait des lignes de tri
    table = table[~table['country'].str.contains('electricity')]

    # Ajustements des types d'énergie
    table['energy_family'] = np.select([table['energy_family'].str.contains("biomass and waste"),
                                           table['energy_family'].str.contains("fossil fuels"),
                                           table['energy_family'].str.contains("geothermal"),
                                           table['energy_family'].str.contains("hydroelectric pumped storage"),
                                           table['energy_family'].str.contains("hydro"),
                                           table['energy_family'].str.contains("nuclear"),
                                           table['energy_family'].str.contains("solar|tide|wave|fuel cell", regex=True),
                                           table['energy_family'].str.contains("wind")],
                                           
                                        ["Biomass and Waste",
                                         "Fossil Fuels",
                                         "Geothermal",
                                         "Hydroelectric Pumped Storage",
                                         "Hydroelectricity",
                                         "Nuclear",
                                         "Solar, Tide, Wave, Fuel Cell",
                                         "Wind"],
                                         
                                         "Trash")
    
    # Retrait des énergies indésirables (temporaire)
    table = table[table['energy_family'] != "Trash"]

    return table


######################################################
###### Chargement et Transformation des données ######
######################################################

if __name__ == "__main__":

    ### Data loading
    current_dir = os.path.dirname(os.path.realpath(__file__))
    path_electricity_capacity = os.path.join(current_dir, "../../data/raw/electricity/data_2023_qua.csv")     
    df_elec_capacity = pd.read_csv(path_electricity_capacity)
    df_elec_capacity = df_elec_capacity.rename(columns={"Unnamed: 1" : "country"})

    path_countries = os.path.join(current_dir, "../../data/raw/demographics/country_groupss.csv")
    df_country = pd.read_csv(path_countries)


    ############ Data Transformation ############

    ### Energy Type
    df_elec_capacity = get_energy_type(df_elec_capacity)

    # Transforming the table
    df_elec_capacity = pd.melt(df_elec_capacity, 
                                id_vars=["country", "energy_family"],
                                value_vars=[str(i) for i in range(1980, 2023)], 
                                var_name='year', 
                                value_name='power')

    ### Country Translation
    df_elec_capacity['country'] = df_elec_capacity['country'].str.strip()
    df_elec_capacity['country'] = CountryTranslatorFrenchToEnglish().run(serie_country_to_translate=df_elec_capacity['country'], 
                                                                            raise_errors=True)
    
    # Data-type Adaptation 
    df_elec_capacity['power'] = np.where(df_elec_capacity['power'].str.contains('--|ie', regex=True), np.NaN, df_elec_capacity['power'])  

    for col, type in zip(df_elec_capacity.columns, [object, object, int, float]):
        df_elec_capacity[col] = df_elec_capacity[col].astype(type)

    df_elec_capacity = df_elec_capacity.dropna() 

    # Making groups of countries
    list_col_group_by = ['group_type', 'group_name', 'energy_family', 'year']
    dict_agg = {"power": "sum"}
    df_elec_capacity = StatisticsPerCountriesAndZonesJoiner().run(df_elec_capacity, df_country, list_col_group_by, dict_agg)

    # Adding the context columns
    df_elec_capacity['source'] = 'US EIA'
    df_elec_capacity['power_unit'] = 'GW'

    # Dataframe ordering
    df_elec_capacity = df_elec_capacity[["source", 'group_type', 'group_name', "year", "energy_family", "power", "power_unit"]]

    # Formating the dataset
    df_elec_capacity = StatisticsDataframeFormatter.select_and_sort_values(df=df_elec_capacity, 
                                                            col_statistics='power')


    #####################################
    ###### Testing and data export ######
    #####################################


    # Testing for missing values
    assert df_elec_capacity.isna().sum().sum() == 0, "Missing values are present in the final dataset." 

    # Exporting to csv
    df_elec_capacity.to_csv(os.path.join(current_dir, "../../data/processed/electricity/WORLD_ENERGY_HISTORY_electricity_capacity_prod.csv"), index=False)


