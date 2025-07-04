import os

from sdp_data_preparation import pik, utils

PROJECT_ROOT_PATH = utils.get_project_root_path()
PIK_DATA_PATH = os.path.join(PROJECT_ROOT_PATH, "data/pik/")

# Yearly greenhouse gas emissions
df = pik.stage_greenhouse_gas_emissions(PIK_DATA_PATH)
dst_filepath = os.path.join(PIK_DATA_PATH, "stg_greenhouse_gas_emissions.csv")
df.to_csv(dst_filepath, index=False)
print(f"Dataset written to {dst_filepath}")

# Process aggregated greenhouse gas emissions by gas
# This is a temporary solution until we know how
# EDGAR, FAO and CAIT data should be processed.
df = pik.process_final_greenhouse_gas_emissions_by_gas(PROJECT_ROOT_PATH).reset_index(drop=True)
dst_filepath = os.path.join(PIK_DATA_PATH, "final_greenhouse_gas_emissions_by_gas.csv")
df.to_csv(dst_filepath, index=False)
print(f"Dataset written to {dst_filepath}")

# Process aggregated greenhouse gas emissions by sector
# This is a temporary solution until we know how
# EDGAR, FAO and CAIT data should be processed.
df = pik.process_final_greenhouse_gas_emissions_by_sector(PROJECT_ROOT_PATH).reset_index(drop=True)
dst_filepath = os.path.join(PIK_DATA_PATH, "final_greenhouse_gas_emissions_by_sector.csv")
df.to_csv(dst_filepath, index=False)
print(f"Dataset written to {dst_filepath}")
