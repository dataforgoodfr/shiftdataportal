import pandas as pd


def extract_source(df_stat: pd.DataFrame):
    try:
        return " + ".join(df_stat["source"].unique().tolist())
    except:
        return "TODO"


def extract_min_date(df_stat: pd.DataFrame):
    return df_stat["year"].dropna().min()


def extract_max_date(df_stat: pd.DataFrame):
    return df_stat["year"].dropna().max()


def extract_n_countries(df_stat: pd.DataFrame):
    return df_stat[df_stat["group_type"].isin(["country", "group"])]["group_name"].nunique()


def add_info(path_file, label, list_filter_apply=None):
    df_stat = pd.read_csv(path_file, sep=",")
    if list_filter_apply is not None:
        for col_filter, value_filter in list_filter_apply:
            df_stat = df_stat[df_stat[col_filter] == value_filter]

    return {"label": label,
            "file": path_file.split("/")[-1],
            "source": extract_source(df_stat),
            "start_date": extract_min_date(df_stat),
            "end_date": extract_max_date(df_stat),
            "n_countries": extract_n_countries(df_stat)
            }


if __name__ == "__main__":
    path_prod_data = "../../server/data/"
    path_interim_data = "../../data/processed/"
    list_overview = []

    # overview demographics data
    file_population_gapminder = path_interim_data + "demographics/DEMOGRAPHIC_POPULATION_GAPMINDER_prod.csv"
    list_overview.append(add_info(file_population_gapminder, "données de population Gapminder"))
    file_population_worlbank = path_interim_data + "demographics/DEMOGRAPHIC_POPULATION_WORLDBANK_prod.csv"
    list_overview.append(add_info(file_population_worlbank, "données de population Worldbank"))

    # Primary energy non-renewable
    file_primary_energy_non_renewable = path_prod_data + "WORLD_ENERGY_HISTORY_primary_energy_prod.csv"
    list_overview.append(
        add_info(file_primary_energy_non_renewable, "Production d'énergies primaires non-renouvelables",
                 list_filter_apply=[("type", "Production")]))
    list_overview.append(
        add_info(file_primary_energy_non_renewable, "Consommation d'énergies primaires non-renouvelables",
                 list_filter_apply=[("type", "Consumption")]))

    # Primary energy renewable
    file_primary_energy_renewable = path_prod_data + "WORLD_ENERGY_HISTORY_renewable_primary_energy_prod.csv"
    list_overview.append(add_info(file_primary_energy_renewable, "Production d'énergies primaires renouvelables",
                                  list_filter_apply=[("type", "Production")]))
    list_overview.append(add_info(file_primary_energy_renewable, "Consommation d'énergies primaires renouvelables",
                                  list_filter_apply=[("type", "Consumption")]))

    # Final energy
    file_final_energy = path_prod_data + "FINAL_ENERGY_CONSUMPTION_final_cons_by_energy_family_full_prod.csv"
    list_overview.append(add_info(file_final_energy, "Consommation d'énergie finale"))

    # Electricity
    file_electricity = path_prod_data + "WORLD_ENERGY_HISTORY_electricity_capacity_prod.csv"
    list_overview.append(add_info(file_electricity, "Capacité de production d'électricité"))
    file_genearation_elec = path_prod_data + "IEA_API_electricity_by_energy_family_prepared_prod.csv"
    list_overview.append(add_info(file_genearation_elec, "génération d'électricité"))

    # Oil
    file_reserves = path_prod_data + "FOSSIL_RESERVES_bp_fossil_with_zones_prod.csv"
    file_import_export = path_prod_data + "FOSSIL_IMPORT_EXPORT_us_eia_fossil_zones_prod.csv"
    list_overview.append(add_info(file_reserves, "Réserves de pétrole", list_filter_apply=[("energy_source", "Oil")]))
    list_overview.append(
        add_info(file_import_export, "Import/Export de pétrole", list_filter_apply=[("energy_source", "Oil")]))
    list_overview.append(add_info(file_primary_energy_non_renewable, "production de pétrole",
                                  list_filter_apply=[("type", "Production"), ("energy_family", "Oil")]))
    list_overview.append(add_info(file_primary_energy_non_renewable, "consommation de pétrole",
                                  list_filter_apply=[("type", "Consumption"), ("energy_family", "Oil")]))

    # Gas
    list_overview.append(add_info(file_reserves, "Réserves de gaz", list_filter_apply=[("energy_source", "Gas")]))
    list_overview.append(
        add_info(file_import_export, "Import/Export de gaz", list_filter_apply=[("energy_source", "Gas")]))
    list_overview.append(add_info(file_primary_energy_non_renewable, "production de gaz",
                                  list_filter_apply=[("type", "Production"), ("energy_family", "Gas")]))
    list_overview.append(add_info(file_primary_energy_non_renewable, "consommation de gaz",
                                  list_filter_apply=[("type", "Consumption"), ("energy_family", "Gas")]))

    # Coal
    list_overview.append(add_info(file_reserves, "Réserves de charbon", list_filter_apply=[("energy_source", "Coal")]))
    list_overview.append(
        add_info(file_import_export, "Import/Export de charbon", list_filter_apply=[("energy_source", "Coal")]))
    list_overview.append(add_info(file_primary_energy_non_renewable, "production de charbon",
                                  list_filter_apply=[("type", "Production"), ("energy_family", "Coal")]))
    list_overview.append(add_info(file_primary_energy_non_renewable, "consommation de charbon",
                                  list_filter_apply=[("type", "Consumption"), ("energy_family", "Coal")]))

    # Renewables
    list_overview.append(add_info(file_primary_energy_renewable, "Production d'énergies primaires renouvelables",
                                  list_filter_apply=[("type", "Production")]))
    list_overview.append(add_info(file_primary_energy_renewable, "Consommation d'énergies primaires renouvelables",
                                  list_filter_apply=[("type", "Consumption")]))

    # Nuclear
    list_overview.append(add_info(file_primary_energy_non_renewable, "production d'énergie nucléaire",
                                  list_filter_apply=[("type", "Production"), ("energy_family", "Nuclear")]))
    list_overview.append(add_info(file_primary_energy_non_renewable, "consommation d'énergie nucléaire",
                                  list_filter_apply=[("type", "Consumption"), ("energy_family", "Nuclear")]))

    # energy intenstity of GDP
    file_energy_intensity = path_prod_data + "ENERGY_INTENSITY_OF_GDP_energies_intensities_of_gdp_prod.csv"
    list_overview.append(add_info(file_energy_intensity, "Intensité énergétique du PIB"))

    # Greenhouse Gas Emissions
    file_ghg = "../../server/data/GHG_EMISSIONS_ghg_full_by_gas_prod.csv"
    list_overview.append(
        add_info(file_ghg, "Emissions de gaz à effet de serre (source PIK)", list_filter_apply=[("source", "PIK")]))
    list_overview.append(
        add_info(file_ghg, "Emissions de gaz à effet de serre (source CAIT)", list_filter_apply=[("source", "CAIT")]))
    list_overview.append(
        add_info(file_ghg, "Emissions de gaz à effet de serre (source EDGAR)", list_filter_apply=[("source", "EDGAR")]))
    list_overview.append(
        add_info(file_ghg, "Emissions de gaz à effet de serre (source FAO)", list_filter_apply=[("source", "FAO")]))

    # CO2 emissions from fossil fuels
    file_co2_emissions = "../../server/data/HISTORICAL_CO2_EMISSIONS_FROM_ENERGY_eia_with_zones_prod.csv"
    list_overview.append(add_info(file_co2_emissions, "Emissions historiques de CO2"))

    # empreinte carbone
    file_carbon_footprint = "../../server/data/CO2_CBA_PER_CAPITA_eora_cba_zones_per_capita_prod.csv"
    list_overview.append(add_info(file_carbon_footprint, "Empreinte carbone (Carbon Footprint)",
                                  list_filter_apply=[("scope", "Carbon Footprint")]))
    list_overview.append(add_info(file_carbon_footprint, "Empreinte carbone (Territorial Emissions)",
                                  list_filter_apply=[("scope", "Territorial Emissions")]))

    # imports / exports de CO2
    file_co2_import_export = "../../server/data/CO2_CONSUMPTION_BASED_ACCOUNTING_eora_co2_trade_by_country_prod.csv"
    df_co2_import_export = pd.read_csv(file_co2_import_export, sep=",")
    list_overview.append({
        "label": "Import/Export de CO2",
        "file": file_co2_import_export.split("/")[-1][:-4],
        "source": "EORA",
        "start_date": "2015",
        "end_date": "2015",
        "n_countries": df_co2_import_export["country"].nunique()
    }
    )

    # Kaya Identity
    file_kaya = "../../server/data/KAYA_kaya_base_100_prod.csv"
    list_overview.append(add_info(file_kaya, "Identité de Kaya"))

    # formatting
    df_all_tracking = pd.concat([pd.DataFrame(el, index=[0]) for el in list_overview], axis=0)
    df_all_tracking["file"] = df_all_tracking["file"].apply(lambda el: el.replace("_prod.csv", ""))
    df_all_tracking["date de début"] = df_all_tracking["start_date"].fillna("0").astype(int)
    df_all_tracking["date de fin"] = df_all_tracking["end_date"].fillna("0").astype(int)
    df_all_tracking = df_all_tracking[["label", "file", "source", "n_countries", "date de début", "date de fin"]]
    df_all_tracking.to_excel("df_overview.xlsx", index=False)
