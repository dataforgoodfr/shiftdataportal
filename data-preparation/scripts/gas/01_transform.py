import os

from sdp_data_preparation import gas, utils


PROJECT_ROOT_PATH = utils.get_project_root_path()

# Proven reserves
src_proven_reserves_filepath = os.path.join(
    PROJECT_ROOT_PATH,
    "data/opec/stg_yearly_proven_reserves_gas.csv"
)
src_countries_zones_filepath = os.path.join(PROJECT_ROOT_PATH, "data/countries/countries_and_zones.csv")
df = gas.stage_proven_reserves(
    proven_reserves_gas_filepath=src_proven_reserves_filepath,
    countries_and_zones_filepath=src_countries_zones_filepath,
)
dst_filepath = os.path.join(PROJECT_ROOT_PATH, "data/gas/stg_yearly_proven_reserves.csv")
df.to_csv(dst_filepath, index=False)
