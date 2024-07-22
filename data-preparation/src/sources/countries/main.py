import pandas as pd
from src.sources.countries.multi_selection_country_groups import \
    process_multi_selection_country_groups

df = pd.read_csv(
    "src/sources/countries/data/multiselect_groups.csv",
    sep=",",
)
multi_selection_country_groups = process_multi_selection_country_groups(df)
multi_selection_country_groups.to_csv(
    "../server/data/country_multiselect_groups.csv",
    sep=",",
    index=False,
)
