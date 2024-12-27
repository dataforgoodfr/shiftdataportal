from utils.translation import CountryTranslatorFrenchToEnglish
import pandas as pd
import numpy as np
import re

def subtract(series1, series2):
    return series1 - series2


def divide(series1, series2):
    return series1.div(series2)


# Constructing the dictionary
operation_dict = {
    'subtract': subtract,
    'divide': divide
}


def data_intersection(df_0, df_1):
    df_0 = df_0.sort_index()
    df_1 = df_1.sort_index()

    common_indices = df_0.index.intersection(df_1.index)

    df_0 = df_0.loc[common_indices].reset_index()
    df_1 = df_1.loc[common_indices].reset_index()

    return df_0, df_1


def diff_evaluation(df_0, df_1, indices_col, col_diff_to_check, operation='substract'):
    """
    Evaluate differences between two dataframes based on a specified operation.
    """
    df_0 = df_0.dropna(subset=indices_col)
    df_1 = df_1.dropna(subset=indices_col)

    df_0 = df_0.drop_duplicates(subset=indices_col)
    df_1 = df_1.drop_duplicates(subset=indices_col)

    df_0 = df_0.set_index(indices_col)
    df_1 = df_1.set_index(indices_col)

    # Dataframe intersection
    df_0_common, df_1_common = data_intersection(df_0, df_1)

    ratio = operation_dict[operation](df_0_common[col_diff_to_check], df_1_common[col_diff_to_check])
    if operation == 'divide':
        ratio = ratio[(ratio > 0.000001) & (ratio < 100000)]

    # Returning statistics including Coefficient of Variation (CV)
    min_ratio = ratio.min()
    max_ratio = ratio.max()
    median_ratio = ratio.median()
    mean_ratio = ratio.mean()
    cv_ratio = ratio.std() / mean_ratio if mean_ratio != 0 else None

    return min_ratio, max_ratio, median_ratio, mean_ratio, cv_ratio


def check_net_imports(df):
    imports_df = df[df['type'] == 'Imports'].sort_values(['group_name', 'year', 'energy_source', 'type']).reset_index(
        drop=True)
    exports_df = df[df['type'] == 'Exports'].sort_values(['group_name', 'year', 'energy_source', 'type']).reset_index(
        drop=True)
    net_imports_df = df[df['type'] == 'Net Imports'].sort_values(
        ['group_name', 'year', 'energy_source', 'type']).reset_index(drop=True)

    # Merge the dataframes
    merged_df = imports_df.merge(exports_df, on=['group_name', 'year', 'energy_source'],
                                 suffixes=('_import', '_export'))
    merged_df = merged_df.merge(net_imports_df, on=['group_name', 'year', 'energy_source'])

    # Calculate Imports - Exports and compare it to Net Imports
    merged_df['calculated_net_imports'] = merged_df['energy_import'] - merged_df['energy_export']
    merged_df['difference'] = merged_df['calculated_net_imports'] - merged_df['energy']

    # Display discrepancies (if any)
    discrepancies = merged_df[abs(merged_df['difference']) > 1e-6]  # Adjust the tolerance as needed
    discrepancies = discrepancies[
        ['group_name', 'year', 'energy_source', 'calculated_net_imports', 'energy', 'difference']]
    return discrepancies


def compare_python_dataiku_dataframes(res_dataiku, res_python, country_col, val_col, indx_col, translation=False,
                                      delete=False):
    if translation:
        if 'group_type' in indx_col:
            res_dataiku[res_dataiku.group_type.isin(['country'])][country_col] = CountryTranslatorFrenchToEnglish().run(
                res_dataiku.copy()[res_dataiku.group_type.isin(['country'])][country_col], raise_errors=False)
        else:
            res_dataiku[country_col] = CountryTranslatorFrenchToEnglish().run(res_dataiku.copy()[country_col],
                                                                              raise_errors=False)
        if delete:
            res_dataiku = res_dataiku[res_dataiku[country_col] != "Delete"]

    res_python = res_python.sort_values(indx_col).reset_index(drop=True)
    res_dataiku = res_dataiku.sort_values(indx_col).reset_index(drop=True)
    res_python[val_col] = round(res_python[val_col], 3)
    res_dataiku[val_col] = round(res_dataiku[val_col], 3)

    # Merging the two dataframes on the unique identifier with an outer join
    merged_df = pd.merge(res_dataiku, res_python, on=res_python.columns.to_list(),
                         suffixes=('_res_dataiku', '_res_python'), how='outer', indicator=True)
    # Identifying rows that are only in one DataFrame or have discrepancies
    # 'left_only' and 'right_only' indicate rows unique to df1 and df2, respectively
    unique_or_diff_df = merged_df[(merged_df['_merge'] != 'both')]
    if len(unique_or_diff_df) == 0:
        print("\033[1mresults are similar\033[0m")
    else:
        return unique_or_diff_df


def check_columns_diff(res_old, res_new, country_col):
    country_old = [x for x in res_old[country_col].unique() if x not in res_new[country_col].unique()]
    country_new = [y for y in res_new[country_col].unique() if y not in res_old[country_col].unique()]
    return country_old, country_new


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


def GroupMaker(table: pd.DataFrame, countries_group: pd.DataFrame) -> pd.DataFrame:

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