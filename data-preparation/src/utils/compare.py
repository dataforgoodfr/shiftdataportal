

class DataComparator:

    @staticmethod
    def compare_dataframes_no_order(df_expected, df_output, columns_to_sort, round=5):

        list_columns_expected = df_expected.columns.tolist()
        df_output = df_output[list_columns_expected].sort_values(columns_to_sort).reset_index(drop=True)
        df_output = df_output.round(round).fillna(999)
        df_expected = df_expected[list_columns_expected].sort_values(columns_to_sort).reset_index(drop=True)
        df_expected = df_expected.round(round).fillna(999)
        df_compare = df_expected == df_output
        dataframe_equals = df_expected.equals(df_output)
        print(df_compare)
        print(df_compare.sum())
        print("dataframes equal : %s" % dataframe_equals)
