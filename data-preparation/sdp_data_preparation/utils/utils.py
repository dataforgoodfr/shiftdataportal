import os
import re
from typing import Dict, List
from urllib.parse import parse_qs, urlencode, urlparse

import pandas as pd


def get_project_root_path() -> str:
    """Returns the path of the project root"""
    dir_path = os.path.dirname(os.path.realpath(__file__))
    dir_name = os.path.basename(dir_path)

    # We go up in the directory level until
    # we are at the root of the project
    while dir_name != "shiftdataportal":
        dir_path = os.path.dirname(dir_path)
        dir_name = os.path.basename(dir_path)

    return dir_path


def update_url_parameters(url: str, params: Dict[str, List[str]]) -> str:
    url_parts = urlparse(url)
    query = parse_qs(url_parts.query, keep_blank_values=True)
    query.update(params)
    url = url_parts._replace(query=urlencode(query, doseq=True)).geturl()
    return url


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Returns the provided DataFrame with column names in snake case and
    without any special characters.
    """
    colnames_mapping = {colname: clean_column_name(colname) for colname in df.columns}
    return df.rename(columns=colnames_mapping, errors="raise")


def clean_column_name(value: str) -> str:
    # Anything that is between parenthesis is removed
    value = re.sub(r"\(.*\)", "", value)
    value = value.strip()
    value = re.sub(r"\s+", "_", value)
    value = re.sub(r"([a-z])([A-Z])", r"\1_\2", value)
    return value.lower()
