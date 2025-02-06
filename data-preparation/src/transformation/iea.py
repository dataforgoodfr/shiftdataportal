from utils.iso3166 import countries
from utils.translation import CountryTranslatorFrenchToEnglish
from sdp_data.transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
from utils.format import StatisticsDataframeFormatter
import requests
import json
import pandas as pd
import os


class EiaScrapper:  # TODO - à refactorer

    def __init__(self) -> None:
        self.list_countries = countries
        self.list_countries_fix = {"AUSTRALI": "Australia",
                                   "BOSNIAHERZ": "Bosnia and Herzegovina",
                                   "BOLIVIA": "Bolivia",
                                   "BRUNEI": "Brunei Darussalam",
                                   "CONGOREP": "Democratic Republic of the Congo",
                                   "COTEIVOIRE": "Côte d'Ivoire",
                                   "COSTARICA": "Costa Rica",
                                   "DOMINICANR": "Dominican Republic",
                                   "ELSALVADOR": "Salvador",
                                   "FYROM": "North Macedonia",
                                   "IRAN": "Iran",
                                   "HONGKONG": "Hong Kong Special Administrative Region (China)",
                                   "KOREA": "South Korea", "KOREADPR": "North Korea", "MOLDOVA": "Moldova",
                                   "NETHLAND": "Netherlands", "NZ": "New Zealand", "RUSSIA": "Russian Federation",
                                   "SAUDIARABI": "Saudi Arabia", "SOUTHAFRIC": "South Africa", "SRILANKA": "Sri Lanka",
                                   "SSUDAN": "South Sudan", "SYRIA": "Syria", "TAIPEI": "Taiwan",
                                   "TANZANIA": "Tanzania", "UK": "United Kingdom", "USA": "United States",
                                   "VIETNAM": "Viet Nam", "VENEZUELA": "Venezuela"}

    def collect_eai_dataset(self, url_end):

        country_list = [country.apolitical_name for country in self.list_countries]
        country_list += self.list_countries_fix.keys()

        url_start = "https://www.iea.org/api/stats/getData.php?country="
        urls = {}
        for country in country_list:
            urls[country] = url_start + country + url_end

        empty_country = " {\
        \"empty\": [\
            {\
                \"value\": \"empty\",\
                \"formattedValue\": \"empty\",\
                \"product\": \"empty\",\
                \"flow\": \"empty\"\
            }]}"

        txt = "{"
        i = 0
        for country, url in urls.items():
            if i > 0:
                txt += ","
            res = requests.get(url).text
            if res.find("2000") == -1:
                txt += "\"" + country + "\":" + empty_country
            else:
                txt += "\"" + country + "\":" + json.dumps(json.loads(res)["colData"])
            i += 1

        txt += "}"

        result = json.loads(txt)

        data = []
        for country in result:
            for year in result[country]:
                for g in result[country][year]:
                    c = self.list_countries_fix.get(country, country)
                    data.append([c, year, g['flow'], g['product'], g['value'], "Ktoe"])

        df = pd.DataFrame(data, columns=['country', 'year', 'flow', 'product', 'final_energy', 'final_energy_unit'])
        df = df[df["final_energy"].notnull()]
        return df


class EiaDataProcessor:

    def __init__(self) -> None:
        self.dict_replace_flow = {
            "AGRICULT": "Agriculture",
            "FISHING": "Other",
            "TOTIND": "Industry",
            "TOTTRANS": "Transport",
            "TFC": "Final Energy Consumption",
            "RESIDENT": "Residential",
            "COMMPUB": "Commercial and public services",
            "NONENUSE": "Other",
            "ONONSPEC": "Other",
            "FINCONS": "Final consumption",
            "EHBIOMASS": "Biomass",
            "EHCOAL": "Coal",
            "EHNATGAS": "Gas",
            "EHOIL": "Oil",
            "EHGEOTHERM": "Geothermal",
            "EHNUCLEAR": "Nuclear",
            "EHSOLARTH": "Solar Thermal",
            "ESOLARPV": "Solar PV",
            "EHWASTE": "Waste",
            "EHYDRO": "Hydro",
            "ETIDE": "Tide",
            "EWIND": "Wind"
        }
        self.dict_replace_product = {
            "NATGAS": "Gas",
            "TOTAL": "Total",
            "TOTPRODS": "Oil products",
            "COAL": "Coal",
            "CRUDEOIL": "Crude oil",
            "COMRENEW": "Biofuels and waste",
            "ELECTR": "Electricity",
            "HYDRO": "Hydro",
            "NUCLEAR": "Nuclear",
            "GEOTHERM": "Geothermal",
            "NGL": "Natural gas liquids",
            "NAPHTHA": "Other",
            "NONBIOGASO": "Motor gasoline",
            "AVGAS": "Aviation gasoline",
            "NONBIOJETK": "Other",
            "OTHKERO": "Other",
            "CRNGFEED": "Crude oil",
            "NONBIODIES": "Gas/diesel",
            "RESFUEL": "Fuel oil",
            "LPG": "Liquified petroleum gases",
            "HEAT": "Heat",
        }
        self.end_url = None
        self.dataset_label = None
        self.list_final_cols_to_drop = None
        self.file_name = None

    @staticmethod
    def convert_energy_ktoe_to_mtoe(final_energy: float, final_energy_unit: str):
        if final_energy_unit == "Ktoe":
            return final_energy * 0.001
        else:
            return final_energy

    @staticmethod
    def convert_energy_gigawatt_to_terrawatt(final_energy: float, final_energy_unit: str):
        if final_energy_unit == "GWh":
            return final_energy * 0.001
        else:
            return final_energy

    @staticmethod
    def select_and_sort_values(df_iea_energy: pd.DataFrame):

        # select and sort values
        list_sort_values = ["group_type", "group_name", "year", "sector", "energy_family, final_energy_unit",
                            "original_dataset"]
        df_iea_energy = df_iea_energy.sort_values(list_sort_values)
        df_iea_energy = df_iea_energy[df_iea_energy + "final_energy"]

        return df_iea_energy

    def prepare_data(self, df_country: pd.DataFrame):
        """
        Collects EIA dataset from API and then prepare the data
        """
        # collect the dataset using EAI API
        print("\n----- prepare dataset %s" % self.dataset_label)
        try:  # TODO - à corriger une fois que l'on aura retrouvé les accès à EIA
            df_iea_data = EiaScrapper().collect_eai_dataset(self.end_url)
        except:
            df_iea_data = pd.read_excel(os.path.join(os.path.dirname(__file__), "../../../data/thibaud/eia_api/" + self.file_name))

        # clean EAI dataset
        df_iea_data = df_iea_data.rename({"flow": "sector", "product": "energy_family"}, axis=1)
        df_iea_data["sector"] = df_iea_data["sector"].replace(self.dict_replace_flow)
        df_iea_data["energy_family"] = df_iea_data["energy_family"].replace(self.dict_replace_product)
        df_iea_data["final_energy"] = pd.to_numeric(df_iea_data["final_energy"], errors="coerce")
        df_iea_data["final_energy"] = df_iea_data.apply(lambda row: self.convert_energy_ktoe_to_mtoe(row["final_energy"], row["final_energy_unit"]), axis=1)
        df_iea_data["final_energy"] = df_iea_data.apply(lambda row: self.convert_energy_gigawatt_to_terrawatt(row["final_energy"], row["final_energy_unit"]), axis=1)
        df_iea_data["final_energy"] = pd.to_numeric(df_iea_data["final_energy"])
        df_iea_data["final_energy_unit"] = df_iea_data["final_energy_unit"].replace({"GWh": "TWh", "Ktoe": "Mtoe"})
        df_iea_data["original_dataset"] = self.dataset_label

        # clean years
        df_iea_data["year"] = pd.to_numeric(df_iea_data["year"], errors="coerce")
        df_iea_data = df_iea_data[df_iea_data["year"].notnull()]
        df_iea_data["year"] = df_iea_data["year"].astype(int).astype(str)

        # translate countries
        df_iea_data['country'] = CountryTranslatorFrenchToEnglish().run(df_iea_data["country"], raise_errors=False)

        # join with countries and format
        list_cols_group_by = ["group_type", "group_name", "year", "sector", "energy_family", "final_energy_unit",
                              "original_dataset"]
        dict_agg = {"final_energy": "sum"}
        df_iea_per_zones_and_countries = StatisticsPerCountriesAndZonesJoiner().run(df_iea_data, df_country, list_cols_group_by, dict_agg)
        df_iea_per_zones_and_countries = StatisticsDataframeFormatter.select_and_sort_values(df_iea_per_zones_and_countries, "final_energy", round_statistics=4)
        if self.list_final_cols_to_drop is not None:
            df_iea_per_zones_and_countries = df_iea_per_zones_and_countries.drop(columns=self.list_final_cols_to_drop)

        return df_iea_per_zones_and_countries


class EiaConsumptionGasBySectorProcessor(EiaDataProcessor):

    def __init__(self) -> None:
        super().__init__()
        self.end_url = "&series=GAS&products=NATGAS&flows=TOTIND,TOTTRANS,RESIDENT,COMMPUB,AGRICULT,FISHING,ONONSPEC,NONENUSE"
        self.dataset_label = "eia_api_final_cons_gas_by_sector"
        self.list_final_cols_to_drop = ["energy_family", "original_dataset"]
        self.df_iea_data = None
        self.file_name = "eia_api_final_cons_gas_by_sector.xlsx"


class EiaConsumptionOilPerProductProcessor(EiaDataProcessor):

    def __init__(self) -> None:
        super().__init__()
        self.end_url = "&series=OIL&products=AVGAS,CRUDEOIL,LPG,NAPHTHA,NGL,NONBIODIES,NONBIOGASO,NONBIOJETK,OTHKERO,RESFUEL&flows=FINCONS"
        self.dataset_label = "eia_api_final_cons_oil_products"
        self.df_iea_data = None
        self.list_final_cols_to_drop = []
        self.file_name = "eia_api_final_cons_oil_products.xlsx"


class EiaConsumptionOilsPerSectorProcessor(EiaDataProcessor):

    def __init__(self) -> None:
        super().__init__()
        self.end_url = "&series=BALANCES&products=TOTPRODS&flows=TOTIND,TOTTRANS,RESIDENT,COMMPUB,AGRICULT,FISHING,ONONSPEC,NONENUSE"
        self.dataset_label = "eia_api_final_cons_oil_products_by_sector"
        self.list_final_cols_to_drop = ["energy_family"]
        self.df_iea_data = None
        self.file_name = "eia_api_final_cons_oil_products_by_sector.xlsx"


class EiaFinalEnergyConsumptionProcessor(EiaDataProcessor):

    def __init__(self) -> None:
        super().__init__()
        self.end_url = "&series=BALANCES&products=COAL,CRNGFEED,NATGAS,ELECTR,HEAT,TOTPRODS,COMRENEW,GEOTHERM&flows=TFC"
        self.dataset_label = "eia_api_final_energy_consumption"
        self.list_final_cols_to_drop = ["sector", "original_dataset"]
        self.df_iea_data = None
        self.file_name = "eia_api_final_energy_consumption.xlsx"


class EiaFinalEnergyConsumptionPerSectorProcessor(EiaDataProcessor):

    def __init__(self) -> None:
        super().__init__()
        self.end_url = "&series=BALANCES&products=TOTAL&flows=TOTIND,TOTTRANS,RESIDENT,COMMPUB,AGRICULT,FISHING,ONONSPEC,NONENUSE"
        self.dataset_label = "eia_api_final_cons_by_sector"
        self.list_final_cols_to_drop = ["energy_family"]
        self.df_iea_data = None
        self.file_name = "eia_api_final_cons_by_sector.xlsx"


class EiaFinalEnergyPerSectorPerEnergyProcessor(EiaDataProcessor):

    def __init__(self) -> None:
        super().__init__()
        self.end_url = "&series=BALANCES&products=COAL,CRNGFEED,NATGAS,ELECTR,HEAT,TOTPRODS,COMRENEW,GEOTHERM&flows=TOTIND,TOTTRANS,RESIDENT,COMMPUB,AGRICULT,FISHING,ONONSPEC,NONENUSE"
        self.dataset_label = "eia_api_final_energy_by_sector_by_energy_family"
        self.list_final_cols_to_drop = None
        self.df_iea_data = None
        self.file_name = "eia_api_final_energy_by_sector_by_energy_family.xlsx"


class EiaElectricityGenerationByEnergyProcessor(EiaDataProcessor):

    def __init__(self) -> None:
        super().__init__()
        self.end_url = "&series=ELECTRICITYANDHEAT&products=ELECTR&flows=EHCOAL,EHOIL,EHNATGAS,EHNUCLEAR,EHYDRO,EHBIOMASS,EHWASTE,EHSOLARTH,ESOLARPV,EWIND,EHGEOTHERM,ETIDE"
        self.dataset_label = "iea_api_electricity_generation_by_energy_family"
        self.list_final_cols_to_drop = ["original_dataset", "energy_family"]
        self.df_electricity_by_energy_family = None
        self.file_name = "iea_api_electricity_generation_by_energy_family.xlsx"

    def prepare_data(self, df_country: pd.DataFrame):
        df_electricity_by_energy_family = super().prepare_data(df_country)
        df_electricity_by_energy_family["source"] = "IEA"
        df_electricity_by_energy_family = df_electricity_by_energy_family.rename({"sector": "energy_family"}, axis=1)
        self.df_electricity_by_energy_family = df_electricity_by_energy_family
        return self

    def compute_nuclear_share_in_electricity(self):
        """
        Computes the share of nuclear in electricity generation for each country and each year.
        """
        # compute the total of nuclear energy
        print("-- compute nuclear electricity share per country")
        assert self.df_electricity_by_energy_family is not None
        df_electricity_by_energy_family = self.df_electricity_by_energy_family.copy()
        df_electricity_nuclear = df_electricity_by_energy_family[df_electricity_by_energy_family['energy_family'] == 'Nuclear']
        df_electricity_nuclear = df_electricity_nuclear.rename({'final_energy': 'nuclear'}, axis=1)

        # compute the energy total
        list_group_by = ['group_type', 'group_name', 'year', 'final_energy_unit', 'source']
        df_electricity_total = self.df_electricity_by_energy_family.copy()
        df_electricity_total = df_electricity_total.groupby(list_group_by).agg({'final_energy': 'sum'}).reset_index()
        df_electricity_total = df_electricity_total[df_electricity_total['final_energy'] > 0]
        df_electricity_total = df_electricity_total.rename({'final_energy': 'final_energy_total'}, axis=1)

        # compute share of nuclear
        group_by_source = ['group_type', 'group_name', 'year', 'final_energy_unit', 'source']
        column_nuclear_share = "nuclear_share_of_electricity_generation"
        df_nuclear_electricity_share = df_electricity_nuclear.merge(df_electricity_total, on=group_by_source, how='inner')
        df_nuclear_electricity_share[column_nuclear_share] = df_nuclear_electricity_share['nuclear'] / df_nuclear_electricity_share['final_energy_total']
        df_nuclear_electricity_share = df_nuclear_electricity_share[group_by_source + ["nuclear", "nuclear_share_of_electricity_generation"]]
        df_nuclear_electricity_share["nuclear"] = df_nuclear_electricity_share["nuclear"].round(4)
        df_nuclear_electricity_share = StatisticsDataframeFormatter().select_and_sort_values(
            df_nuclear_electricity_share, "nuclear_share_of_electricity_generation", round_statistics=4)
        return df_nuclear_electricity_share

    def compute_electricity_co2_intensity(self, df_intensity_co2_per_energy: pd.DataFrame):
        """
        Computes the CO2 intensity of electricity for each country.
        """
        # intensitity of CO2 in electricity for each country
        print("-- compute CO2 intensity in electricity per country")
        assert self.df_electricity_by_energy_family is not None
        df_co2_intensity = self.df_electricity_by_energy_family.merge(df_intensity_co2_per_energy, how="left",
                                                                      left_on="energy_family", right_on="energy")
        df_co2_intensity = df_co2_intensity.drop(columns=["min", "max"])
        df_co2_intensity = df_co2_intensity.rename({"median": "co2_intensity", "source": "source_co2_intensity"}, axis=1)
        df_co2_intensity["co2"] = df_co2_intensity["co2_intensity"] * df_co2_intensity["final_energy"]
        df_co2_intensity = df_co2_intensity.groupby(["group_type", "group_name", "year"]).agg({"co2": "sum", "final_energy": "sum"}).reset_index()
        df_co2_intensity["co2_intensity"] = (df_co2_intensity["co2"] / df_co2_intensity["final_energy"]).fillna(0.0)  # in case of division by 0
        df_co2_intensity = df_co2_intensity[df_co2_intensity["co2_intensity"] > 0.0]
        df_co2_intensity = df_co2_intensity.drop(["co2", "final_energy"], axis=1)
        df_co2_intensity = StatisticsDataframeFormatter().select_and_sort_values(df_co2_intensity, "co2_intensity", round_statistics=3)

        return df_co2_intensity
