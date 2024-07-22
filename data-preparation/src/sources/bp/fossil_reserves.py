import sys

import numpy as np
import pandas as pd

sys.path.insert(0, r'C:\Users\HP\Desktop\shiftdataportal_data')
from src.utils.translation import CountryTranslatorFrenchToEnglish


class CoalReservesConsolidatedProdGenerator:

    def __init__(self):
        # Initialize any necessary variables or state here
        self.dict_energy_converter = {'Hard Coal': 1.5, 'Brown Coal': 3}

    def process(self, df):
        df["year"] = df["year"].astype(int)
        df["proven_reserves"] = df["proven_reserves"].str.replace(" ", "").replace("-", "")
        df['proven_reserves'] = pd.to_numeric(df['proven_reserves'], errors='coerce')
        df["proven_reserves_energy"] = df.apply(
            lambda row: row['proven_reserves'] / self.dict_energy_converter.get(row['coal_type'], np.nan), axis=1)
        df["proven_reserves_energy_unit"] = "Mtoe"
        df.rename(columns={'country': 'group_name'}, inplace=True)
        df['source'] = "Survey of Energy Resources, World Energy Council 2010"
        return df

    def run(self, df_coal_reserves):
        df_coal_reserves = pd.melt(df_coal_reserves, id_vars=["country", "unit", "coal_type"], var_name='year',
                                   value_name='proven_reserves')
        # print(df_coal_reserves.info())
        df_coal_reserves = self.process(df_coal_reserves)
        df_coal_reserves_grouped = df_coal_reserves.groupby(
            ['group_name', 'year', 'proven_reserves_energy_unit', 'source'])
        df_coal_reserves_consoliated = df_coal_reserves_grouped['proven_reserves_energy'].sum().reset_index()
        # Renaming the summed column to 'proven_reserves'
        df_coal_reserves_consoliated.rename(columns={'proven_reserves_energy': 'proven_reserves'}, inplace=True)

        return df_coal_reserves_consoliated


class OilProvenReservesNormalizedGenerator:

    def __init__(self):
        pass

    def run(self, df_oil_proven_reserves: pd.DataFrame) -> pd.DataFrame:
        """
        Translates the country names in the oil proven reserves DataFrame from French to English.

        Parameters:
        df_oil_proven_reserves (pd.DataFrame): DataFrame containing oil proven reserves data.

        Returns:
        pd.DataFrame: Updated DataFrame with translated country names.
        """
        df_oil_proven_reserves["country"] = CountryTranslatorFrenchToEnglish().run(df_oil_proven_reserves["country"],
                                                                                   raise_errors=False)
        df_oil_proven_reserves = df_oil_proven_reserves[df_oil_proven_reserves["country"] != "Delete"]

        return df_oil_proven_reserves


class OilProvenReservesProdGenerator:

    def __init__(self):
        # Initialize any necessary variables or state here
        pass

    def run(self, df_country: pd.DataFrame, df_oil_proven_reserves_normalized: pd.DataFrame) -> pd.DataFrame:
        """
        Computes oil proven reserves for each group (country, zone, etc.) by merging and aggregating data.

        Parameters:
        df_country (pd.DataFrame): DataFrame containing country or zone grouping information.
        df_oil_proven_reserves_normalized (pd.DataFrame): DataFrame containing normalized oil proven reserves data.

        Returns:
        pd.DataFrame: Aggregated DataFrame with proven reserves by group.
        """
        # Perform a left join between the groups and reserves dataframes on the 'country' column
        merged_df = pd.merge(df_country, df_oil_proven_reserves_normalized, on='country', how='left')

        # Group by group_type, group_name, and unit, then sum the proven_reserves
        grouped_df = merged_df.groupby(['group_type', 'group_name', 'unit'], as_index=False)['proven_reserves'].sum()

        # For the second part of the union, select the countries directly with their proven reserves and unit
        countries_df = df_oil_proven_reserves_normalized[['country', 'proven_reserves', 'unit']].copy()
        countries_df.rename(columns={'country': 'group_name'}, inplace=True)
        countries_df['group_type'] = 'country'

        # Concatenate the two dataframes to mimic the UNION ALL operation
        final_df = pd.concat([grouped_df, countries_df], ignore_index=True, sort=False)

        return final_df


class GasProvenReservesNormalizedGenerator:

    def __init__(self):
        pass

    def run(self, df_gas_proven_reserves: pd.DataFrame) -> pd.DataFrame:
        """
        Computes the translation of countries names of the data of gas proven reserves.
        """
        df_gas_proven_reserves["country"] = CountryTranslatorFrenchToEnglish().run(df_gas_proven_reserves["country"],
                                                                                   raise_errors=False)
        df_gas_proven_reserves = df_gas_proven_reserves[df_gas_proven_reserves["country"] != "Delete"]

        return df_gas_proven_reserves


class BpFossilWithZonesProdGeneratorOLD:

    def __init__(self):
        # Initialize any necessary variables or state here
        self.dict_unit_converter = {'Gas': 'Bcm', 'Oil': 'Gb'}

    def process(self, df):
        df["year"] = df["year"].astype(int)
        df['proven_reserves'] = pd.to_numeric(df['proven_reserves'], errors='coerce')
        df["proven_reserves_unit"] = df.apply(lambda row: self.dict_unit_converter.get(row['energy_source'], np.nan),
                                              axis=1)

        return df

    def run(self, df_bp_gas_proven_reserves: pd.DataFrame, df_bp_oil_proven_reserves: pd.DataFrame,
            df_country: pd.DataFrame) -> pd.DataFrame:
        """
        Computes fossil (gas,oil) proven reserves for each country, zone for the source BP.
        """
        # Add 'energy_source' column to each DataFrame
        df_bp_gas_proven_reserves['energy_source'] = 'Gas'
        df_bp_oil_proven_reserves['energy_source'] = 'Oil'

        # Combines the gas and oil DataFrames.
        df_bp_oilgal_proven_reserves_stacked = pd.concat([df_bp_gas_proven_reserves, df_bp_oil_proven_reserves])

        # Transforms the combined DataFrame so that each year's data becomes a separate row.
        df_bp_oilgal_proven_reserves_stacked = pd.melt(df_bp_oilgal_proven_reserves_stacked,
                                                       id_vars=["country", "energy_source"], var_name='year',
                                                       value_name='proven_reserves')

        # Applies the process method to clean and convert proven reserves data.
        df_bp_oilgal_proven_reserves_stacked = self.process(df_bp_oilgal_proven_reserves_stacked)

        df_bp_oilgal_proven_reserves_stacked.dropna(subset='proven_reserves', inplace=True)

        df_bp_oilgal_proven_reserves_stacked = df_bp_oilgal_proven_reserves_stacked.reset_index(drop=True)

        # Apply translation to countries names from frensh to english
        df_bp_oilgal_proven_reserves_stacked["country"] = CountryTranslatorFrenchToEnglish().run(
            df_bp_oilgal_proven_reserves_stacked["country"], raise_errors=False)
        df_bp_oilgal_proven_reserves_stacked = df_bp_oilgal_proven_reserves_stacked[
            df_bp_oilgal_proven_reserves_stacked["country"] != "Delete"]

        # Perform a left join between the two DataFrames on the 'country' column
        merged_df = pd.merge(df_country, df_bp_oilgal_proven_reserves_stacked, on='country', how='left')

        # Group by the necessary columns and calculate the sum of proven reserves
        grouped_df = merged_df.groupby(['group_type', 'group_name', 'energy_source', 'year', 'proven_reserves_unit'],
                                       as_index=False)['proven_reserves'].sum()

        # Filter out groups where the sum of proven reserves is not null
        grouped_df = grouped_df[grouped_df['proven_reserves'].notnull()].reset_index(drop=True)

        # For the second part of the union, select the rows directly with their original columns
        countries_df = df_bp_oilgal_proven_reserves_stacked[
            ['country', 'energy_source', 'year', 'proven_reserves', 'proven_reserves_unit']].copy()
        countries_df.rename(columns={'country': 'group_name'}, inplace=True)
        countries_df['group_type'] = 'country'

        # Concatenate the two DataFrames to mimic the UNION ALL operation
        final_df = pd.concat([grouped_df, countries_df], ignore_index=True, sort=False)
        # diference there is no other cis and other europpe, in translatio n I added them+6

        return final_df


class BpFossilWithZonesProdGeneratorNEW:

    def __init__(self):
        # Initialize necessary variables, including a dictionary for unit conversion.
        self.dict_units_coef = {
            'Oil': {'Gb': 1, 'bbl': 1},
            'Gas': {'Tcm': 0.001, 'Bcm': 1}
        }
        self.default_unit = {'Oil': 'Gb', 'Gas': 'Bcm'}

    def process(self, df):
        """
         Clean and preprocess the DataFrame
        """
        df = df.dropna(subset=['Value', 'Country', 'Year']).reset_index(drop=True)
        df['proven_reserves_unit'] = np.where(df['Var'] == 'gasreserves_tcm', 'Tcm',
                                              np.where(df['Var'] == 'oilreserves_bbl', 'bbl', ''))
        df['energy_source'] = np.where(df['Var'] == 'gasreserves_tcm', 'Gas',
                                       np.where(df['Var'] == 'oilreserves_bbl', 'Oil', ''))
        df = df[['Country', 'Year', 'energy_source', 'proven_reserves_unit', 'Value']]

        column_renames = {
            'Year': 'year',
            'Country': 'country',
            'Value': 'proven_reserves',
        }
        df.rename(columns=column_renames, inplace=True)
        df["year"] = df["year"].astype(int)
        df['proven_reserves'] = pd.to_numeric(df['proven_reserves'], errors='coerce')

        return df

    def run(self, df_bp_api: pd.DataFrame, df_country: pd.DataFrame) -> pd.DataFrame:
        """
        Computes fossil (gas,oil) proven reserves for each country, zone for the source BP.
        """
        df_bp_oilgal_proven_reserves_stacked = df_bp_api[
            df_bp_api.Var.isin(['gasreserves_tcm', 'oilreserves_bbl'])].reset_index(drop=True)

        # Applies the process method to clean and convert proven reserves data.
        df_bp_oilgal_proven_reserves_stacked = self.process(df_bp_oilgal_proven_reserves_stacked)

        df_bp_oilgal_proven_reserves_stacked.dropna(subset='proven_reserves', inplace=True)

        df_bp_oilgal_proven_reserves_stacked = df_bp_oilgal_proven_reserves_stacked.reset_index(drop=True)

        df_bp_oilgal_proven_reserves_stacked['proven_reserves'] = df_bp_oilgal_proven_reserves_stacked.apply(
            lambda x: self.dict_units_coef[x['energy_source']][x['proven_reserves_unit']] * x['proven_reserves'],
            axis=1)
        df_bp_oilgal_proven_reserves_stacked['proven_reserves_unit'] = df_bp_oilgal_proven_reserves_stacked[
            'energy_source'].map(self.default_unit)

        # Apply translation to countries names from frensh to english
        df_bp_oilgal_proven_reserves_stacked["country"] = CountryTranslatorFrenchToEnglish().run(
            df_bp_oilgal_proven_reserves_stacked["country"], raise_errors=False)
        df_bp_oilgal_proven_reserves_stacked = df_bp_oilgal_proven_reserves_stacked[
            df_bp_oilgal_proven_reserves_stacked["country"] != "Delete"]

        # Perform a left join between the two DataFrames on the 'country' column
        merged_df = pd.merge(df_country, df_bp_oilgal_proven_reserves_stacked, on='country', how='left')

        # Group by the necessary columns and calculate the sum of proven reserves
        grouped_df = merged_df.groupby(['group_type', 'group_name', 'energy_source', 'year', 'proven_reserves_unit'],
                                       as_index=False)['proven_reserves'].sum()

        # Filter out groups where the sum of proven reserves is not null
        grouped_df = grouped_df[grouped_df['proven_reserves'].notnull()].reset_index(drop=True)

        # For the second part of the union, select the rows directly with their original columns
        countries_df = df_bp_oilgal_proven_reserves_stacked[
            ['country', 'energy_source', 'year', 'proven_reserves', 'proven_reserves_unit']].copy()
        countries_df.rename(columns={'country': 'group_name'}, inplace=True)
        countries_df['group_type'] = 'country'

        # Concatenate the two DataFrames to mimic the UNION ALL operation
        final_df = pd.concat([grouped_df, countries_df], ignore_index=True, sort=False)
        # diference there is no other cis and other europpe, in translatio n I added them+6

        return final_df

class FossilProvenReservesProdGenerator:

    def __init__(self):
        # Initialize any necessary variables or state here
        pass

    def run(self, df_gas_proven_reserves: pd.DataFrame, df_oil_proven_reserves: pd.DataFrame,
                                            df_coal_proven_reserves: pd.DataFrame, df_country: pd.DataFrame) -> pd.DataFrame:
        """
        Computes fossil (gas,oil,coal) proven reserves for each country, zone.
        """
        # Add 'energy_source' column to each DataFrame
        df_gas_proven_reserves['energy_source'] = 'Gas'
        df_oil_proven_reserves['energy_source'] = 'Oil'
        df_coal_proven_reserves['energy_source'] = 'Coal'

        # Combine all fossil fuel data
        df_fossil_proven_reserves_stacked = pd.concat(
            [df_gas_proven_reserves, df_oil_proven_reserves, df_coal_proven_reserves])
        df_fossil_proven_reserves_stacked['country'] = df_fossil_proven_reserves_stacked['country'].str.replace('\xa0',
                                                                                                                ' ').str.strip()
        df_fossil_proven_reserves_stacked["country"] = CountryTranslatorFrenchToEnglish().run(
            df_fossil_proven_reserves_stacked["country"], raise_errors=False)

        # Remove rows with NaN in 'country'
        df_fossil_proven_reserves_stacked.dropna(subset='country', inplace=True)

        # Perform a left join between the two DataFrames on the 'country' column
        merged_df = pd.merge(df_country, df_fossil_proven_reserves_stacked, on='country', how='left')

        # Group by the necessary columns and calculate the sum of proven reserves
        grouped_df = merged_df.groupby(['group_type', 'group_name', 'energy_source', 'unit'], as_index=False)[
            'proven_reserves'].sum()

        # Filter out groups where the sum of proven reserves is not null
        grouped_df = grouped_df[grouped_df['proven_reserves'].notnull()].reset_index(drop=True)

        # For the second part of the union, select the rows directly with their original columns
        countries_df = df_fossil_proven_reserves_stacked[['country', 'energy_source', 'proven_reserves', 'unit']].copy()
        countries_df.rename(columns={'country': 'group_name'}, inplace=True)
        countries_df['group_type'] = 'country'

        # Concatenate the two DataFrames to mimic the UNION ALL operation
        final_df = pd.concat([grouped_df, countries_df], ignore_index=True, sort=False)
        # resut are not equal exactly because in the dataiku we keep nan value, we don't translate South koreaa, and there is missing value in the result like afghanistan in gas
        return final_df



