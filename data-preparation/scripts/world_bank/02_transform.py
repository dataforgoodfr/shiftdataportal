import os

from sdp_data_preparation import utils, world_bank

PROJECT_ROOT_PATH = utils.get_project_root_path()
WORLD_BANK_DATA_PATH = os.path.join(PROJECT_ROOT_PATH, "data/world_bank/")

# Stage population data
df = world_bank.stage_population(WORLD_BANK_DATA_PATH)
dst_filepath = os.path.join(WORLD_BANK_DATA_PATH, "stg_population.csv")
df.to_csv(dst_filepath, index=False)

# Process final population data
# This is a temporary solution to get it as consistent
# as possible with what was done before. But this data
# should be processed and stored under a 'macro_economics'
# or 'population' folder.
df = world_bank.process_final_population(PROJECT_ROOT_PATH).reset_index(drop=True)
dst_filepath = os.path.join(WORLD_BANK_DATA_PATH, "final_population.csv")
df.to_csv(dst_filepath, index=False)
