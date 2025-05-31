import os

import pandas as pd

from utils import get_project_root_path


def stage_proven_reserves_gas() -> pd.DataFrame:
    filepath = os.path.join(get_project_root_path(), "data/opec/raw_proven_reserves_gas_1960_2023.xlsx")
    raw_proven_reserves_gas = pd.read_excel(filepath)
    return raw_proven_reserves_gas
