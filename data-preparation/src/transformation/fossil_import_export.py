import sys

import numpy as np
import pandas as pd

sys.path.insert(0, r'C:\Users\HP\Desktop\shiftdataportal_data')
from src.utils.translation import CountryTranslatorFrenchToEnglish
from src.utils.utils import diff_evaluation


# Class to update recent data
class FossilProvenReservesProdGeneratorNEW:

    def __init__(self):
        # Initialize conversion coefficients for different energy sources
        self.dict_units_coef = {
            'Oil': {'Mb/d': 1, 'TBPD': 0.001},
            'Coal': {'MTOE': 1, 'TJ': 2.38 * 10 ** (-5), 'QBTU': 25.199},
            'Gas': {'BCF': 1, 'BCM': 35.3147}
        }
        self.default_unit = {'Oil': 'Mb/d', 'Coal': 'MTOE', 'Gas': 'BCF'}

    def process(self, df):
        """
        Process and clean the input DataFrame.
        """
        df = df.dropna(subset=['value']).reset_index(drop=True)
        df = df[['period', 'productName', 'activityName', 'countryRegionName', 'unit', 'value']]
        column_renames = {
            'period': 'year',
            'productName': 'energy_source',
            'activityName': 'type',
            'countryRegionName': 'group_name',
            'unit': 'energy_unit',
            'value': 'energy'
        }
        df.rename(columns=column_renames, inplace=True)
        df["year"] = df["year"].astype(int)
        df["energy"] = df["energy"].str.replace(" ", "").replace("-", "")
        df['energy'] = pd.to_numeric(df['energy'], errors='coerce')
        return df

    def identify_units(self, df, energy_type, unit_ref):
        """
        Identify suitable units for conversion based on a reference unit.
        """
        units_to_consider = []
        for unit in self.dict_units_coef[energy_type].keys():
            df_ref = df[(df.energy_source == energy_type) & (df.energy_unit == unit_ref)]
            df_unit = df[(df.energy_source == energy_type) & (df.energy_unit == unit)]
            min_, max_, median_, mean_, cv_ = diff_evaluation(df_ref, df_unit, ['year', 'group_name', 'type'], 'energy',
                                                              'divide')
            if cv_ < 0.00001:
                units_to_consider.append(unit)
        return units_to_consider

    def exports_imports_data(self, eia_api, df_country):
        """
        Process and filter export and import data for oil, gas, and coal.
        """
        eia_api = self.process(eia_api)
        eia_api = eia_api[eia_api.type.isin(['Imports', 'Exports'])].reset_index(drop=True)
        eia_api = eia_api[eia_api.energy_source.isin(
            ['Crude oil including lease condensate', 'Dry natural gas', 'Coal'])].reset_index(drop=True)
        eia_api.energy_source.replace({'Crude oil including lease condensate': 'Oil', 'Dry natural gas': 'Gas'},
                                      inplace=True)

        eia_api = eia_api[(eia_api.energy_source == 'Oil') & (
            eia_api.energy_unit.isin(self.identify_units(eia_api, 'Oil', 'TBPD'))) | (
                                      eia_api.energy_source == 'Gas') & (
                              eia_api.energy_unit.isin(self.identify_units(eia_api, 'Gas', 'BCF'))) | (
                                      eia_api.energy_source == 'Coal') & (
                              eia_api.energy_unit.isin(self.identify_units(eia_api, 'Coal', 'MTOE')))]
        eia_api['energy'] = eia_api.apply(
            lambda x: self.dict_units_coef[x['energy_source']][x['energy_unit']] * x['energy'], axis=1)
        eia_api['energy_unit'] = eia_api['energy_source'].map(self.default_unit)

        eia_api.drop_duplicates(subset=['year', 'energy_source', 'type', 'group_name'], inplace=True)

        eia_api["source"] = "US EIA"
        eia_api.dropna(subset='energy', inplace=True)
        eia_api.drop_duplicates(inplace=True)
        eia_api['group_name'] = CountryTranslatorFrenchToEnglish().run(eia_api['group_name'], raise_errors=False)
        eia_api = eia_api[eia_api["group_name"] != "Delete"]
        eia_api = eia_api[eia_api['type'].notnull()]
        eia_api.drop_duplicates(subset=['year', 'energy_source', 'type', 'group_name'], inplace=True)
        eia_api = eia_api.reset_index(drop=True)
        eia_api['group_type'] = 'country'

        return eia_api

    def net_imports_data(self, df):
        """
        Calculate net imports data by subtracting exports from imports.
        """
        df_net_imports = df.copy()
        df_net_imports['energy'] = df.apply(lambda x: x['energy'] if x['type'] == 'Imports' else -x['energy'], axis=1)
        df_net_imports = df_net_imports[df_net_imports['type'].notnull()]
        df_net_imports = df_net_imports.groupby(['group_name', 'energy_unit', 'energy_source', 'year', 'source'])[
            'energy'].sum().reset_index()
        df_net_imports['type'] = 'Net Imports'
        df_net_imports['group_type'] = 'country'

        return df_net_imports

    def run(self, eia_api, df_country):
        """
        Execute the processing of export and import data and net imports calculation.
        """
        eia_api_ = self.exports_imports_data(eia_api, df_country)
        df_net_imports_ = self.net_imports_data(eia_api_)
        df_final = pd.concat([df_net_imports_, eia_api_]).reset_index(drop=True)

        return df_final


# dataik => python code translation (OLD data)
class FossilProvenReservesProdGeneratorOLD:

    def __init__(self):
        # Initialize any necessary variables or state here
        pass

    def process(self, df):
        df["year"] = df["year"].astype(int)
        df["energy"] = df["energy"].str.replace(" ", "").replace("-", "")
        df['energy'] = pd.to_numeric(df['energy'], errors='coerce')
        return df

        return row

    def run(self, df_us_eia_oil, df_us_eia_gas, df_us_eia_coal, df_country):

        df_us_eia_oil = pd.melt(df_us_eia_oil,
                                id_vars=["country", "energy_unit", "energy_source", "type", "subtype", "subsubtype",
                                         "subsubsubtype"], var_name='year', value_name='energy')
        df_us_eia_gas = pd.melt(df_us_eia_gas,
                                id_vars=["country", "energy_unit", "energy_source", "type", "subtype", "subsubtype"],
                                var_name='year', value_name='energy')
        df_us_eia_coal = pd.melt(df_us_eia_coal, id_vars=["country", "energy_unit", "energy_source", "type", "subtype"],
                                 var_name='year', value_name='energy')

        df_us_eia_gas = df_us_eia_gas[df_us_eia_gas.subtype == 'Gross natural gas'].reset_index(drop=True)
        df_us_eia_coal = df_us_eia_coal[df_us_eia_coal.subtype == 'Total primary coal'].reset_index(drop=True)
        # df_us_eia_oil = df_us_eia_oil[df_us_eia_oil.energy_source=='Petroleum and other liquids (annual)'].reset_index(drop=True) #a eliminer

        df_us_eia_oil.drop(columns=["subtype", "subsubtype", "subsubsubtype"], axis=1, inplace=True)
        df_us_eia_gas.drop(columns=["subtype", "subsubtype"], axis=1, inplace=True)
        df_us_eia_coal.drop(columns=["subtype"], axis=1, inplace=True)

        df_us_eia_oil['energy_source'] = 'Oil'
        df_us_eia_gas['energy_source'] = 'Gas'
        df_us_eia_coal['energy_source'] = 'Coal'

        df_grouped = pd.concat([df_us_eia_oil, df_us_eia_gas, df_us_eia_coal]).reset_index(drop=True)

        df_grouped["energy_unit"].replace("MMTOE", "Mtoe", inplace=True)
        df_grouped = df_grouped[df_grouped.type.isin(['Imports', 'Exports'])].reset_index(drop=True)
        df_grouped = self.process(df_grouped)
        df_grouped.dropna(subset='energy', inplace=True)
        df_grouped["country"] = CountryTranslatorFrenchToEnglish().run(df_grouped["country"], raise_errors=False)
        df_grouped = df_grouped[df_grouped["country"] != "Delete"]
        df_grouped.rename(columns={'country': 'group_name'}, inplace=True)
        df_grouped = df_grouped.reset_index(drop=True)
        df_grouped = df_grouped.groupby(['year', 'energy_source', 'type', 'group_name', 'energy_unit'])[
            'energy'].sum().reset_index()  # à rendre
        # df_grouped.drop_duplicates(subset=['year', 'energy_source', 'type', 'group_name'], inplace=True)

        df_net_imports = df_grouped.copy()
        df_net_imports['energy'] = df_net_imports.apply(
            lambda x: x['energy'] if x['type'] == 'Imports' else -x['energy'], axis=1)
        # df_net_imports = df_net_imports[df_net_imports['type'].notnull()]
        grouped = df_net_imports.groupby(['group_name', 'energy_unit', 'energy_source', 'year'])
        # Collect indices of rows to drop
        indices_to_drop = []

        # Iterate over each group
        for _, group in grouped:
            types_present = group['type'].unique()
            if 'Imports' not in types_present or 'Exports' not in types_present:
                # Collect indices of incomplete groups
                indices_to_drop.extend(group.index.tolist())

        # Drop these rows from the original DataFrame
        # df_net_imports = df_net_imports.drop(indices_to_drop)

        df_net_imports = df_net_imports.groupby(['group_name', 'energy_unit', 'energy_source', 'year'])[
            'energy'].sum().reset_index()
        df_net_imports['type'] = 'Net Imports'
        df_net_imports = df_net_imports[df_net_imports["group_name"] != "Delete"]
        df_net_imports = df_net_imports[df_net_imports['type'].notnull()]
        df_grouped = df_grouped[df_grouped['type'].notnull()]
        df_final = pd.concat([df_net_imports, df_grouped]).reset_index(drop=True)
        # df_final.drop_duplicates(subset=['year', 'energy_source', 'type', 'group_name', 'energy'], inplace=True)
        df_final["source"] = "US EIA"
        df_final['group_type'] = 'country'

        return df_final


