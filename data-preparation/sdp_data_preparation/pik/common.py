import pandas as pd


def prepare_stg_dataset_for_prod(df: pd.DataFrame, is_gas_dataset: bool = True) -> pd.DataFrame:
    # To get consistent with the data in production, we rename some
    # columns with the same names we have in production
    df = df.rename(columns={"unit": "ghg_unit", "greenhouse_gas_emission": "ghg"})

    common_columns = ["country", "year", "ghg_unit"]
    variable_columns = ["gas"] if is_gas_dataset else ["sector"]
    grouped_columns = common_columns + variable_columns

    return df.groupby(grouped_columns).agg({"ghg": "sum"}).reset_index()
