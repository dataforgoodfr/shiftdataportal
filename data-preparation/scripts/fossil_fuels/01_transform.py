import os

from sdp_data_preparation import fossil_fuels, utils


PROJECT_ROOT_PATH = utils.get_project_root_path()

# Proven reserves
df = fossil_fuels.stage_proven_reserves(PROJECT_ROOT_PATH)
dst_filepath = os.path.join(PROJECT_ROOT_PATH, "data/fossil_fuels/stg_proven_reserves.csv")
df.to_csv(dst_filepath, index=False)
