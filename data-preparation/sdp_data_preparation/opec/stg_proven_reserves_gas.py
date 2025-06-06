import pandas as pd

from sdp_data_preparation.countries_and_zones import CountryNameTranslator


def stage_proven_reserves_gas(input_data_filepath: str) -> pd.DataFrame:
    raw_proven_reserves_gas = pd.read_excel(input_data_filepath)
    df = _set_columns(raw_proven_reserves_gas)
    df = _drop_unnecessary_lines(df)
    df = _translate_country(df)
    df = _column_to_line(df)
    df = _convert_types(df)
    return _add_columns(df)


def _set_columns(df: pd.DataFrame) -> pd.DataFrame:
    # Rename first column
    return df.rename(columns={df.columns[0]: "country"})


def _drop_unnecessary_lines(df: pd.DataFrame) -> pd.DataFrame:
    countries_to_be_dropped = [
        'Africa',
        'Latin America',
        'Other Asia',
        'Other Eurasia',
        'Middle East',
        'OECD Europe',
        'OECD Asia Pacific',
        'OECD Americas',
        'Others',
        'Other Europe',
        'Total World',
        'of which',
        'OPEC',
        'OPEC percentage',
        'OECD',
    ]
    df = df[~df['country'].str.strip().isin(countries_to_be_dropped)]
    return df.reset_index()


def _translate_country(df: pd.DataFrame) -> pd.DataFrame:
    country_name_translator = CountryNameTranslator()
    df["country"] = country_name_translator.run(df["country"], raise_errors=False)
    return df


def _column_to_line(df: pd.DataFrame) -> pd.DataFrame:
    df = pd.melt(
        df,
        id_vars="country",
        var_name="year",
        value_name="proven_reserves",
    )
    return df.dropna()


def _convert_types(df: pd.DataFrame) -> pd.DataFrame:
    df.loc[:, 'year'] = pd.to_numeric(df["year"], errors="coerce")
    df.loc[:, 'country'] = df['country'].astype(str)
    df.loc[:, 'proven_reserves'] = pd.to_numeric(df["proven_reserves"], errors="coerce")
    return df.dropna()


def _add_columns(df: pd.DataFrame) -> pd.DataFrame:
    df["energy_source"] = "Gas"
    df["proven_reserves_unit"] = "Bcm"
    return df
