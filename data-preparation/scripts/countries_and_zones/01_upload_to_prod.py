import os

import pandas as pd

from sdp_data_preparation import utils

PROJECT_ROOT_PATH = utils.get_project_root_path()
COUNTRIES_DATA_PATH = os.path.join(PROJECT_ROOT_PATH, "data/countries_and_zones/")
PROD_DATA_PATH = os.path.join(PROJECT_ROOT_PATH, "server/data/")

# Countries and zones reference frames
filepath = os.path.join(COUNTRIES_DATA_PATH, "final_countries_and_zones.csv")
df = pd.read_csv(filepath).sort_values(by=["group_type", "group_name", "country"])
dst_filepath = os.path.join(PROD_DATA_PATH, "country_multiselect_groups.csv")
df.to_csv(dst_filepath, index=False)
