import os
import pandas as pd

from sdp_data_preparation.countries_and_zones import CountryNameTranslator

# TODO: vérifier droits de licence OPEC
# TODO: remplacer les totaux par ceux déjà donnés dans le fichier ?


def stage_yearly_proven_reserves_oil(opec_data_path: str) -> pd.DataFrame:
    filepath = os.path.join(opec_data_path, "raw_yearly_proven_reserves_oil.xlsx")
    yearly_proven_reserves_oil = pd.read_excel(filepath)
    df = _set_columns(yearly_proven_reserves_oil)
    df = _drop_unnecessary_lines(df)
    df = _convert_from_mb_to_gb(df)
    df = _translate_country(df)
    df = _column_to_line(df)
    return _add_columns(df)


def _set_columns(df: pd.DataFrame) -> pd.DataFrame:
    # Rename first column
    return df.rename(columns={'Unnamed: 0': 'country'})


def _drop_unnecessary_lines(df: pd.DataFrame) -> pd.DataFrame:
    """
    Drop footnotes not necessary for data processing
    """
    countries_to_be_dropped = [
        'Africa',
        'Latin America',
        'Other Asia',
        'Other Eurasia',
        'Middle East ',
        'OECD Europe',
        'OECD Asia Pacific',
        'OECD Americas',
        'Others',
        'Other Europe',
        'Total World'
    ]
    df = df[~df['country'].str.strip().isin(countries_to_be_dropped)]
    return df.reset_index(drop=True)


def _convert_from_mb_to_gb(df: pd.DataFrame) -> pd.DataFrame:
    proven_reserves_cols = [col for col in df.columns if col != "country"]
    for col in proven_reserves_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce') / 1000

    return df


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


def _add_columns(df: pd.DataFrame) -> pd.DataFrame:
    df["energy_source"] = "Oil"
    df["proven_reserves_unit"] = "Gb"
    return df
