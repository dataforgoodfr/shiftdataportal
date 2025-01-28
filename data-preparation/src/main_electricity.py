############################
###### Initialisation ######
############################

import pandas as pd
from utils.utils import get_energy_type, pivot_dates, CountryTranslatorFrenchToEnglish, GroupMaker
from utils.format import StatisticsDataframeFormatter
import os

PATH_MAIN = r'../../data-preparation/src'
PATH_ELECTRICITY_DATA = r'../../data/data_2023_qua.csv'
PATH_COUNTRIES = r'../../country_groups.csv'
EXPORT_PATH = r'../../data/new_prod_data/WORLD_ENERGY_HISTORY_electricity_capacity_prod.csv'

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
    table['energy_family'] = np.where(table['Unnamed: 1'].str.contains('electricity'), table['Unnamed: 1'], np.NaN)

    # Affectation du type d'énergie pour chaque ligne
    table['energy_family'] = table['energy_family'].ffill()

    # Récupération du type d'énergie
    table['energy_family'] = table['energy_family'].apply(lambda text: re.findall("(.*)electricity", text).pop())

    # Retrait des lignes de tri
    table = table[~table['Unnamed: 1'].str.contains('electricity')]

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


def pivot_dates(table: pd.core.frame.DataFrame, dates=[str(i) for i in range(1980, 2024)]) -> pd.DataFrame:

    """Cette fonction affecte la date correspondante pour chaque pays, type d'éléctricité.
    
    Paramètres:
        table: Table où le type d'éléctricité est repertorié.

    Sortie:
        Renvoie la table d'entrée dotée de la colonne 'energy_family'."""


    table['Unnamed: 1'] = table['Unnamed: 1'].str.strip()

    # Pivot par date
    temp = (pd.melt(table,
                   value_vars=dates,
                   id_vars=['Unnamed: 1', "energy_family"])
              .sort_values(['Unnamed: 1', "variable"]))
    
    # Réattribution des noms des colonnes
    temp.columns = ["country", "energy_family", "year", "power"]

    # Nettoyage des doublons
    temp = (temp.sort_values(["country", "energy_family", "year", "power"])).reset_index(drop=True)
    
    # Adaptation du type de données
    temp['power'] = np.where(temp['power'].str.contains('--|ie', regex=True), np.NaN, temp['power'])       # Changement des valeurs "--" et "ie" en NaN

    temp = temp.dropna()                                                                                   # Retrait des valeurs manquantes

    for col, type in zip(temp.columns, [object, object, int, float]):

        temp[col] = temp[col].astype(type)                                                                 # Conversion du type pour chaque colonne

    return temp


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
df_elec_capacity = df_elec_capacity.rename(columns={"country" : "group_name"})

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
df_elec_capacity = group_maker(df_elec_capacity, countries)

# Adding the context columns
df_elec_capacity['source'] = 'US EIA'
df_elec_capacity['power_unit'] = 'GW'

# Dataframe ordering
df_elec_capacity = df_elec_capacity[["source", "group_type", "country", "year", "energy_family", "power", "power_unit"]]
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