import os

from sdp_data_preparation import oil, utils


PROJECT_ROOT_PATH = utils.get_project_root_path()

# Yearly proven reserves
df = oil.stage_yearly_proven_reserves(PROJECT_ROOT_PATH)
dst_filepath = os.path.join(PROJECT_ROOT_PATH, "data/oil/stg_yearly_proven_reserves.csv")
df.to_csv(dst_filepath, index=False)
