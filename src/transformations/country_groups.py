import pandas as pd

from src.transformations.new_country_group_member import add_new_members_to_group


def update_country_groups(raw_country_groups: pd.DataFrame) -> pd.DataFrame:
    """
    Returns the country group dataset with the most up-to-date data.
    :param raw_country_groups: DataFrame that contains the raw data of the country groups.
    """
    country_groups = raw_country_groups.copy()

    # Removal of UK from EU
    country_groups = country_groups[
        ~(
                (country_groups.group_name == "EU28")
                & (country_groups.country == "United Kingdom")
        )
    ]

    # Replace EU28 with EU27
    country_groups.loc[country_groups.group_name == "EU28", "group_name"] = "EU27"

    # Add Colombia, Costa Rica, Estonia, Israel, Latvia, Lithuania, Slovenia to OECD members
    new_oecd_members = [
        "Colombia",
        "Costa Rica",
        "Estonia",
        "Israel",
        "Latvia",
        "Lithuania",
        "Slovenia",
    ]
    country_groups = add_new_members_to_group(
        country_groups,
        new_members=new_oecd_members,
        group_name="OECD",
        is_country_group=True,
    )

    # Add Congo, Equatorial Guinea, Gabon, Libya to OPEC members
    new_opec_members = [
        "Congo",
        "Equatorial Guinea",
        "Gabon",
        "Libya",
    ]
    country_groups = add_new_members_to_group(
        country_groups,
        new_members=new_opec_members,
        group_name="OPEC",
        is_country_group=True,
    )

    # Removal of Ecuador and Qatar from OPEC
    country_groups = country_groups[
        ~(
                (country_groups.group_name == "OPEC")
                & (country_groups.country.isin(["Ecuador", "Qatar"]))
        )
    ]
    return country_groups
