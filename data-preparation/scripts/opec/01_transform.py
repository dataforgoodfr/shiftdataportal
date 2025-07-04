import os

from sdp_data_preparation import opec, utils

OPEC_DATA_PATH = os.path.join(utils.get_project_root_path(), "data/opec/")

# Proven reserves of gas
df = opec.stage_proven_reserves_gas(OPEC_DATA_PATH)
dst_filepath = os.path.join(OPEC_DATA_PATH, "stg_proven_reserves_gas.csv")
df.to_csv(dst_filepath, index=False)

# Proven reserves of oil
df = opec.stage_proven_reserves_oil(OPEC_DATA_PATH)
dst_filepath = os.path.join(OPEC_DATA_PATH, "stg_proven_reserves_oil.csv")
df.to_csv(dst_filepath, index=False)
