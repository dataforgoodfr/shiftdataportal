from typing import List

import pandas as pd


class StatisticsDataframeFormatter:

    def __init__(
            self,
            df: pd.DataFrame,
            col_statistics: str,
            round_statistics: int = None,
    ) -> None:
        self.df = df
        self.col_statistics = [col_statistics]
        self.round_statistics = round_statistics

    @property
    def sorted_columns(self) -> List[str]:
        common_columns = [
            col
            for col in ["group_type", "group_name", "country", "year"]
            if col in self.df.columns
        ]
        other_columns = sorted([col for col in self.df.columns if col not in common_columns + self.col_statistics])
        selection_sorted_columns = common_columns + other_columns + self.col_statistics
        return selection_sorted_columns

    def run(self) -> pd.DataFrame:
        """
        Formats the Shift data portal data by selecting and sorting the columns
        """
        # Format
        if "year" in self.df.columns:
            # Pourquoi remplaçons-nous les valeurs nulles à 0 pour l'année ?
            self.df["year"] = self.df["year"].fillna("0").astype(int).astype(str)

        # Round stat column
        if self.round_statistics is not None:
            self.df[self.col_statistics] = self.df[self.col_statistics].round(self.round_statistics)

        sorted_columns = self.sorted_columns
        return self.df.sort_values(sorted_columns)[sorted_columns]
