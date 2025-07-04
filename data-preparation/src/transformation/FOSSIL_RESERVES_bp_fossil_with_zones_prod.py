import numpy as np

class BpFossilProvenReservesCleaner:

    def __init__(self):
        # Initialize any necessary variables or state here
        pass

    def drop_unnecessary_columns(self, df):
        # Columns selection
        return df.drop(columns=['ISO3166_numeric', 'ISO3166_alpha3'], axis=1)

    def filter_oil_and_gas(self, df):
        # Filter oil & gas
        return df[df['Var'].isin(['gasreserves_tcm', 'oilreserves_bbl'])].reset_index(drop=True)

    def add_and_convert_units(self, df):
        # Add and convert unit columns
        df['proven_reserves_unit'] = np.where(df['Var'] == 'gasreserves_tcm', 'tcm',
                                              np.where(df['Var'] == 'oilreserves_bbl', 'bbl', ''))
        df['proven_reserves_unit'].replace({'bbl': 'Gb', 'tcm': 'Bcm'}, inplace=True)
        df.loc[df.proven_reserves_unit == 'Bcm', 'Value'] *= 1000  # Convert unit from tcm to bcm
        return df

    def replace_and_rename_columns(self, df):
        # Replace variable names and rename columns
        df['Var'].replace({'gasreserves_tcm': 'Gas', 'oilreserves_bbl': 'Oil'}, inplace=True)
        df = df.rename(
            columns={'Country': 'group_name', 'Year': 'year', 'Value': 'proven_reserves', 'Var': 'energy_source'})
        return df

    def classify_group_types(self, df):
        # Classify and replace group names and types
        df['group_type'] = 'country'
        group_replacements = {'Total OECD': 'OECD', 'Total OPEC': 'OPEC', 'Total EU': 'EU28', 'Total CIS': 'CIS'}
        df['group_name'].replace(group_replacements, inplace=True)
        df.loc[df.group_name.isin(group_replacements.values()), 'group_type'] = 'group'

        zone_replacements = {'Total S. & Cent. America': 'Central and South America',
                             'Total North America': 'North America', 'Total Africa': 'Africa',
                             'Total Europe': 'Europe', 'Total World': 'World',
                             'Total Middle East': 'Middle East', 'Total Asia Pacific': 'Asia Pacific'}
        df['group_name'].replace(zone_replacements, inplace=True)
        df.loc[df.group_name.isin(zone_replacements.values()), 'group_type'] = 'zone'

        return df

    def clean_data(self, df):
        # Sequence of data cleaning steps
        df = self.drop_unnecessary_columns(df)
        df = self.filter_oil_and_gas(df)
        df = self.add_and_convert_units(df)
        df = self.replace_and_rename_columns(df)
        df = self.classify_group_types(df)
        df = df.drop(columns=['OPEC', 'EU', 'OECD', 'CIS', 'Region', 'SubRegion'], axis=1)
        return df