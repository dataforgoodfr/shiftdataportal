import os

import pandas as pd

from sdp_data_preparation import gapminder, utils

PROJECT_ROOT_PATH = utils.get_project_root_path()
GAPMINDER_DATA_PATH = os.path.join(PROJECT_ROOT_PATH, "data/gapminder/")

# Get raw population data
src_filepath = os.path.join(GAPMINDER_DATA_PATH, "raw_population_datasets.xlsx")
df = pd.read_excel(src_filepath, sheet_name="data-pop-gmv8-in-columns")
dst_filepath = os.path.join(GAPMINDER_DATA_PATH, "raw_yearly_population.csv")
df.to_csv(dst_filepath, index=False)

# Stage population data
df = gapminder.stage_yearly_population(GAPMINDER_DATA_PATH)
dst_filepath = os.path.join(GAPMINDER_DATA_PATH, "stg_yearly_population.csv")
df.to_csv(dst_filepath, index=False)

# Process final population data
# This is a temporary solution to get it consistent
# with what was done before. But this data should be
# processed and stored under a 'macro_economics' or
# 'population' folder.
df = gapminder.process_final_yearly_population(PROJECT_ROOT_PATH).reset_index(drop=True)
dst_filepath = os.path.join(GAPMINDER_DATA_PATH, "final_yearly_population.csv")
df.to_csv(dst_filepath, index=False)

