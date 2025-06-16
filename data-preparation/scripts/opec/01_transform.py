import os

from sdp_data_preparation import opec, utils

OPEC_DATA_PATH = os.path.join(utils.get_project_root_path(), "data/opec/")

# Yearly proven reserves of gas
df = opec.stage_yearly_proven_reserves_gas(OPEC_DATA_PATH)
dst_filepath = os.path.join(OPEC_DATA_PATH, "stg_yearly_proven_reserves_gas.csv")
df.to_csv(dst_filepath, index=False)
