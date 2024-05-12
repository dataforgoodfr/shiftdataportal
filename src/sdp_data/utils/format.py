import pandas as pd


class StatisticsDataframeFormatter:

    @staticmethod
    def select_and_sort_values(df: pd.DataFrame, col_statistics: str, round_statistics=None):
        """
        Formats the Shift data portal data by selecting and sorting the columns
        """
        list_cols_common = [col for col in ["group_type", "group_name", "country", "year"] if col in df.columns]
        list_other_cols = sorted([col for col in df.columns if col not in list_cols_common + [col_statistics]])
        list_cols_sort_select = list_cols_common + list_other_cols + [col_statistics]

        # format
        if "year" in df.columns.tolist():
            df["year"] = df["year"].fillna("0").astype(int).astype(str)

        # round values
        if round_statistics is not None:
            df[col_statistics] = df[col_statistics].round(round_statistics)

        return df.sort_values(list_cols_sort_select)[list_cols_sort_select]