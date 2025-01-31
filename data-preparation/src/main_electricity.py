############################
###### Initialisation ######
############################

import pandas as pd
import numpy as np
import re
from utils.utils import CountryTranslatorFrenchToEnglish
from utils.format import StatisticsDataframeFormatter
import os

PATH_MAIN = r'../../data-preparation/src'
PATH_ELECTRICITY_DATA = r'../data/data_2023_qua.csv'                                   # A modifier selon l'emplacement de la table brut (table téléchargée)
PATH_COUNTRIES = r'country_groups.csv'                                                                  # A adapter selon la localisation du fichier country_groups.csv
EXPORT_PATH = r'../data/new_prod_data/WORLD_ENERGY_HISTORY_electricity_capacity_prod.csv'

os.chdir(PATH_MAIN)

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
    table['energy_family'] = np.where(table['group_name'].str.contains('electricity'), table['group_name'], np.NaN)

    # Affectation du type d'énergie pour chaque ligne
    table['energy_family'] = table['energy_family'].ffill()

    # Récupération du type d'énergie
    table['energy_family'] = table['energy_family'].apply(lambda text: re.findall("(.*)electricity", text).pop())

    # Retrait des lignes de tri
    table = table[~table['group_name'].str.contains('electricity')]

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

def group_maker(table: pd.DataFrame, countries_group: pd.DataFrame) -> pd.DataFrame:

    """Cette fonction calcule les statistiques énergétiques pour chaque groupe/zone, par type d'électricité et par année et les ajoute à la table de base.
    
    Paramètres:
        table: Table où le type d'éléctricité est repertorié.

        countries_group: Table où sont répertoriés les différents pays appartenants aux groupes.

    Sortie:
        Renvoie la table de statistiques pour pays, groupe et zone."""
    
    # Initialisation des groupes et colonnes
    zones = ['Africa', 'Asia and Oceania', 'Central and South America', 'Eurasia', 'Europe', 'Middle East', 'World', 'North America']
    table['group_type'] = "country"
    table = table.rename(columns={'group_name':'country'})

    countries_before_merge = sorted(table['country'].unique().tolist())
    groups_before_merge = sorted(countries_group['group_name'].unique().tolist())

    # Fusion des tables
    temp = pd.merge(table, countries_group, how='left', on="country")

    # Calcul des statistiques par groupe
    group_energy = temp.groupby(['group_name', 'energy_family', 'year'])['power'].sum().reset_index()
    group_energy.columns = table.columns[:-1]

    # Ajout des groupes à la table de base
    table = pd.concat([table, group_energy]).sort_values(['country', 'energy_family', 'year'])

    # Traitement de la colonne "group_type"
    table["group_type"] = table["group_type"].fillna('group')
    table['group_type'] = np.where(table['country'].isin(zones), 'zone', table['group_type'])


    # Testing
    assert sorted(table[table['group_type']=="country"]['country'].unique().tolist()+['World']) == countries_before_merge, "Countries after merging are differents."
    assert sorted(table[table['group_type'].isin(["zone", "group"])]['country'].unique().tolist()) == groups_before_merge, "Groups after merging are differents."

    print('Merge tests : OK')

    return table

######################################################
###### Chargement et Transformation des données ######
######################################################


### Data loading 
df_elec_capacity = pd.read_csv(PATH_ELECTRICITY_DATA, skiprows=1)
df_elec_capacity = df_elec_capacity.rename(columns={"Unnamed: 1" : "group_name"})

# Importing the country groups table
df_countries = pd.read_csv(PATH_COUNTRIES)


############ Data Transformation ############

### Energy Type
df_elec_capacity = get_energy_type(df_elec_capacity)

# Transforming the table
df_elec_capacity = pd.melt(df_elec_capacity, 
                            id_vars=["group_name", "energy_family"],
                            value_vars=[str(i) for i in range(1998, 2023)], 
                            var_name='year', 
                            value_name='power')

### Country Translation
df_elec_capacity['group_name'] = df_elec_capacity['group_name'].str.strip()
df_elec_capacity['group_name'] = CountryTranslatorFrenchToEnglish().run(serie_country_to_translate=df_elec_capacity['group_name'], 
                                                                        raise_errors=True)

# Data-type Adaptation 
df_elec_capacity['power'] = np.where(df_elec_capacity['power'].str.contains('--|ie', regex=True), np.NaN, df_elec_capacity['power'])  

for col, type in zip(df_elec_capacity.columns, [object, object, int, float]):
    df_elec_capacity[col] = df_elec_capacity[col].astype(type)

df_elec_capacity = df_elec_capacity.dropna()  


# Adding groups to dataset
df_elec_capacity = group_maker(df_elec_capacity, df_countries)

# Adding the context columns
df_elec_capacity['source'] = 'US EIA'
df_elec_capacity['power_unit'] = 'GW'

# Dataframe ordering
df_elec_capacity = df_elec_capacity[["source", "group_type", "country", "year", "energy_family", "power", "power_unit"]]
df_elec_capacity = df_elec_capacity.rename(columns={"country" : "group_name"})

# Formating the dataset
df_elec_capacity = StatisticsDataframeFormatter.select_and_sort_values(df=df_elec_capacity, 
                                                           col_statistics='power')

# Removing unneeded data
df_elec_capacity = df_elec_capacity[df_elec_capacity['group_name'] != "Delete"]


#####################################
###### Testing and data export ######
#####################################

# Testing for missing values
assert df_elec_capacity.isna().sum().sum() == 0, "Missing values are present in the final dataset." 

# Exporting to csv
df_elec_capacity.to_csv(EXPORT_PATH, index=False)