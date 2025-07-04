import os

import pandas as pd

from sdp_data_preparation import utils

DATA_PATH = os.path.join(utils.get_project_root_path(), "data/pik/")

# Here we split the raw dataset into 2 because its size
# is above the GitHub warning size of 50 Mb.
# We also drop some columns that don't bring any relevant information
# to help reduce the size of the datasets. The column 'source' is
# always 'PRIMAP-hist_v2.5_final' and the column 'scenario (PRIMAP-hist)'
# is either 'HISTCR' or 'HISTTP'.
# To know where the raw dataset comes from, please refer to the README.md in
# 'sdp_data_preparation.pik'
src_filepath = os.path.join(DATA_PATH, "raw_greenhouse_gas_emissions.csv")
df = pd.read_csv(src_filepath).drop(columns=["source"])

df_country_reported = df[df["scenario (PRIMAP-hist)"] == "HISTCR"].drop(columns=["scenario (PRIMAP-hist)"])
dst_filepath = os.path.join(DATA_PATH, "raw_greenhouse_gas_emissions_country_reported.csv")
df_country_reported.to_csv(dst_filepath, index=False)

df_third_party = df[df["scenario (PRIMAP-hist)"] == "HISTTP"].drop(columns=["scenario (PRIMAP-hist)"])
dst_filepath = os.path.join(DATA_PATH, "raw_greenhouse_gas_emissions_third_party.csv")
df_third_party.to_csv(dst_filepath, index=False)
