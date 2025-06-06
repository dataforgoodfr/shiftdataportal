import os

from sdp_data_preparation import opec, utils

OPEC_DATA_PATH = os.path.join(utils.get_project_root_path(), "data/opec/")

# Proven reserves
src_filepath = os.path.join(OPEC_DATA_PATH, "raw_yearly_proven_reserves_gas.xlsx")
df = opec.stage_proven_reserves_gas(src_filepath)
dst_filepath = os.path.join(OPEC_DATA_PATH, "stg_yearly_proven_reserves_gas.csv")
df.to_csv(dst_filepath, index=False)
