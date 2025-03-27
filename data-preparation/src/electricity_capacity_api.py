import requests
import pandas as pd
import json
import numpy as np
import re
import time
from utils.translation import CountryTranslatorFrenchToEnglish
from utils.format import StatisticsDataframeFormatter
from transformation.demographic.countries import StatisticsPerCountriesAndZonesJoiner
import os


API_KEY = "ylfmO1udIGtPIpZbz2UNcC5jwSNGuK4a3Vsl6ItL"

#### Functions ####


def api_call(country_code):

    # Requesting data for country
    global API_KEY
    URL = f'https://api.eia.gov/v2/international/data/?frequency=annual&api_key={API_KEY}&data[0]=value&facets[activityId][]=7&facets[productId][]=27&facets[productId][]=28&facets[productId][]=33&facets[productId][]=35&facets[productId][]=36&facets[productId][]=37&facets[productId][]=38&facets[productId][]=82&facets[countryRegionId][]={country_code}&facets[unit][]=MK&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000'
    result = requests.get(URL).content

    # Storing and formatting data into a dataframe
    df_electricity = pd.DataFrame(json.loads(result)['response']['data'])
    df_electricity = df_electricity[['period', 'productName', 'countryRegionName', 'value']]
    df_electricity.columns = ['year', 'energy_family', 'country', 'power']
    df_electricity['power'] = np.where(df_electricity['power'].isin(["NA", '--', 'ie']), np.NaN, df_electricity['power'])

    time.sleep(3)

    return df_electricity



#### Program Execution ####

if __name__ == "__main__":


    #### Creating Country List ####

    countries = """Aruba (ABW)
    Afghanistan (AFG)
    Angola (AGO)
    Albania (ALB)
    United Arab Emirates (ARE)
    Argentina (ARG)
    Armenia (ARM)
    American Samoa (ASM)
    Antigua and Barbuda (ATG)
    Australia (AUS)
    Austria (AUT)
    Azerbaijan (AZE)
    Burundi (BDI)
    Belgium (BEL)
    Benin (BEN)
    Burkina Faso (BFA)
    Bangladesh (BGD)
    Bulgaria (BGR)
    Bahrain (BHR)
    The Bahamas (BHS)
    Bosnia and Herzegovina (BIH)
    Belarus (BLR)
    Belize (BLZ)
    Bermuda (BMU)
    Bolivia (BOL)
    Brazil (BRA)
    Barbados (BRB)
    Brunei (BRN)
    Bhutan (BTN)
    Botswana (BWA)
    Central African Republic (CAF)
    Canada (CAN)
    Switzerland (CHE)
    Chile (CHL)
    China (CHN)
    Cote d'Ivoire (CIV)
    Cameroon (CMR)
    Congo-Kinshasa (COD)
    Congo-Brazzaville (COG)
    Cook Islands (COK)
    Colombia (COL)
    Comoros (COM)
    Cabo Verde (CPV)
    Costa Rica (CRI)
    Former Czechoslovakia (CSK)
    Cuba (CUB)
    Cayman Islands (CYM)
    Cyprus (CYP)
    Czechia (CZE)
    Germany (DEU)
    Djibouti (DJI)
    Dominica (DMA)
    Denmark (DNK)
    Dominican Republic (DOM)
    Algeria (DZA)
    Ecuador (ECU)
    Egypt (EGY)
    Eritrea (ERI)
    Spain (ESP)
    Estonia (EST)
    Ethiopia (ETH)
    Finland (FIN)
    Fiji (FJI)
    Falkland Islands (FLK)
    France (FRA)
    Faroe Islands (FRO)
    Micronesia (FSM)
    Gabon (GAB)
    United Kingdom (GBR)
    Georgia (GEO)
    Ghana (GHA)
    Gibraltar (GIB)
    Guinea (GIN)
    Guadeloupe (GLP)
    Gambia, The (GMB)
    Guinea-Bissau (GNB)
    Equatorial Guinea (GNQ)
    Greece (GRC)
    Grenada (GRD)
    Greenland (GRL)
    Guatemala (GTM)
    French Guiana (GUF)
    Guam (GUM)
    Guyana (GUY)
    Hawaiian Trade Zone (HITZ)
    Hong Kong (HKG)
    Honduras (HND)
    Croatia (HRV)
    Haiti (HTI)
    Hungary (HUN)"
    Indonesia (IDN)
    India (IND)
    Ireland (IRL)
    Iran (IRN)
    Iraq (IRQ)
    Iceland (ISL)
    Israel (ISR)
    Italy (ITA)
    Jamaica (JAM)
    Jordan (JOR)
    Japan (JPN)
    Kazakhstan (KAZ)
    Kenya (KEN)
    Kyrgyzstan (KGZ)
    Cambodia (KHM)
    Kiribati (KIR)
    Saint Kitts and Nevis (KNA)
    South Korea (KOR)
    Kuwait (KWT)
    Laos (LAO)
    Lebanon (LBN)
    Liberia (LBR)
    Libya (LBY)
    Saint Lucia (LCA)
    Sri Lanka (LKA)
    Lesotho (LSO)
    Lithuania (LTU)
    Luxembourg (LUX)
    Latvia (LVA)
    Macau (MAC)
    Morocco (MAR)
    Moldova (MDA)
    Madagascar (MDG)
    Maldives (MDV)
    Mexico (MEX)
    North Macedonia (MKD)
    Mali (MLI)
    Malta (MLT)
    Burma (MMR)
    Montenegro (MNE)
    Mongolia (MNG)
    Northern Mariana Islands (MNP)
    Mozambique (MOZ)
    Mauritania (MRT)
    Montserrat (MSR)
    Martinique (MTQ)
    Mauritius (MUS)
    Malawi (MWI)
    Malaysia (MYS)
    Namibia (NAM)
    New Caledonia (NCL)
    Niger (NER)
    Nigeria (NGA)
    Nicaragua (NIC)
    Niue (NIU)
    Netherlands (NLD)
    Netherlands Antilles (NLDA)
    Norway (NOR)
    Nepal (NPL)
    Nauru (NRU)
    New Zealand (NZL)
    Oman (OMN)
    Pakistan (PAK)
    Panama (PAN)
    Peru (PER)
    Philippines (PHL)
    Papua New Guinea (PNG)
    Poland (POL)
    Puerto Rico (PRI)
    North Korea (PRK)
    Portugal (PRT)
    Paraguay (PRY)
    Palestinian Territories (PSE)
    French Polynesia (PYF)
    Qatar (QAT)
    Reunion (REU)
    Romania (ROU)
    Russia (RUS)
    Rwanda (RWA)
    Saudi Arabia (SAU)
    Former Serbia and Montenegro (SCG)
    Sudan (SDN)
    Senegal (SEN)
    Singapore (SGP)
    Saint Helena (SHN)
    Solomon Islands (SLB)
    Sierra Leone (SLE)
    El Salvador (SLV)
    Somalia (SOM)
    Saint Pierre and Miquelon (SPM)
    Serbia (SRB)
    South Sudan (SSD)
    Sao Tome and Principe (STP)
    Former U.S.S.R. (SUN)
    Suriname (SUR)
    Slovakia (SVK)
    Slovenia (SVN)
    Sweden (SWE)
    Eswatini (SWZ)
    Seychelles (SYC)
    Syria (SYR)
    Turks and Caicos Islands (TCA)
    Chad (TCD)
    Togo (TGO)
    Thailand (THA)
    Tajikistan (TJK)
    Turkmenistan (TKM)
    Timor-Leste (TLS)
    Tonga (TON)
    Trinidad and Tobago (TTO)
    Tunisia (TUN)
    Turkiye (TUR)
    Tuvalu (TUV)
    Taiwan (TWN)
    Tanzania (TZA)
    Uganda (UGA)
    Ukraine (UKR)
    Uruguay (URY)
    United States (USA)
    U.S. Pacific Islands (USIQ)
    Uzbekistan (UZB)
    Saint Vincent/Grenadines (VCT)
    Venezuela (VEN)
    British Virgin Islands (VGB)
    U.S. Virgin Islands (VIR)
    Vietnam (VNM)
    Vanuatu (VUT)
    Wake Island (WAK)
    Brazil (WP13)
    Canada (WP14)
    China (WP15)
    India (WP16)
    Japan (WP17)
    Mexico (WP18)
    Russia (WP25)
    Samoa (WSM)
    Kosovo (XKS)
    Yemen (YEM)
    Former Yugoslavia (YUG)
    South Africa (ZAF)
    Zambia (ZMB) 
    Zimbabwe (ZWE)"""


    countries = countries.replace('\n',' ')
    country_codes = re.findall('\((\w{3,4})\)', countries)


    #### Requesting the API ####
    df_elec_capacity = pd.concat([api_call(code) for code in country_codes])

    # NaN Cleaning
    df_elec_capacity['year'] = df_elec_capacity['year'].astype(int)
    df_elec_capacity['power'] = df_elec_capacity['power'].reset_index(drop=True)
    df_elec_capacity[['country', 'year', 'energy_family', 'power']].dropna()
    df_elec_capacity['power'] = df_elec_capacity['power'].astype(float)

    # Translating countries
    df_elec_capacity['country'] = df_elec_capacity['country'].str.strip()
    df_elec_capacity['country'] = CountryTranslatorFrenchToEnglish().run(df_elec_capacity['country'], raise_errors=True)

    #Building paths
    current_dir = os.path.dirname(os.path.realpath(__file__))
    path_countries = os.path.join(current_dir, "../../data/raw/demographics/country_groups.csv")
    df_country = pd.read_csv(path_countries)

    # Adding groups to the table
    list_col_group_by = ['group_type', 'group_name', 'energy_family', 'year']
    dict_agg = {"power": "sum"}
    df_elec_capacity = StatisticsPerCountriesAndZonesJoiner().run(df_elec_capacity, df_country, list_col_group_by, dict_agg)

    # Adding the context columns
    df_elec_capacity['source'] = 'US EIA'
    df_elec_capacity['power_unit'] = 'GW'

    # Dataframe ordering
    df_elec_capacity = df_elec_capacity[["source", 'group_type', 'group_name', "year", "energy_family", "power", "power_unit"]]

    # Dropping missing values
    df_elec_capacity = df_elec_capacity.dropna() 

    # Formating the dataset
    df_elec_capacity = StatisticsDataframeFormatter.select_and_sort_values(df=df_elec_capacity, 
                                                            col_statistics='power')

    #### Exporting to csv ####
    df_elec_capacity.to_csv(os.path.join(current_dir, "../../data/processed/electricity/WORLD_ENERGY_HISTORY_electricity_capacity_prod.csv"), index=False)