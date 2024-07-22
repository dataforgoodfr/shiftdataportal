from typing import Union, List

import pandas as pd


def add_new_members_to_group(
        df: pd.DataFrame,
        new_members: Union[str, List[str]],
        group_name: str,
        is_country_group: bool,
) -> pd.DataFrame:
    """
    Adds one or several countries that are members to a country group or organisation into a DataFrame which
    contains country group data. This or these new members are added as new rows at the end of the DataFrame.
    For example with this function, we can add Colombia to the OECD organisation
    into the `country_groups` DataFrame.
    :param df: DataFrame that contains country group data and to which the new members are added.
    :param new_members: list of new members to add to the country group.
    :param group_name: name of the country group (e.g. OECD, OPEC, etc).
    :param is_country_group: True if the provided DataFrame is the country groups, False if it is the multi-selection country groups.
    :return: the provided DataFrame with the new members added.
    """
    if isinstance(new_members, str):
        new_members = [new_members]

    rows = []
    for new_member in new_members:
        if is_country_group:
            row = {
                "group_type": "group",
                "group_name": group_name,
                "country": new_member,
            }
        else:
            row = {
                "group": group_name,
                "country": new_member,
            }
        rows.append(row)
    new_members_to_add = pd.DataFrame(data=rows)
    return pd.concat([df, new_members_to_add], ignore_index=True)
