import os

import pandas as pd
from sdp_data_preparation import utils

PROJECT_ROOT_PATH = utils.get_project_root_path()
FOSSIL_FUELS_DATA_PATH = os.path.join(PROJECT_ROOT_PATH, "data/fossil_fuels/")
PROD_DATA_PATH = os.path.join(PROJECT_ROOT_PATH, "server/data/")

# Proven reserves
filepath = os.path.join(FOSSIL_FUELS_DATA_PATH, "stg_proven_reserves.csv")
df = pd.read_csv(filepath)
dst_filepath = os.path.join(
    PROD_DATA_PATH, "FOSSIL_RESERVES_bp_fossil_with_zones_prod.csv"
)
df.to_csv(dst_filepath, index=False)
