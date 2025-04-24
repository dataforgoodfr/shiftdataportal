import requests
import pandas as pd
import json
import numpy as np
import time


API_KEY = "ylfmO1udIGtPIpZbz2UNcC5jwSNGuK4a3Vsl6ItL"

#### Functions ####


def api_call(country_code, url):

    # Requesting data for country
    global API_KEY
    url_temp = url.replace('APIKEY', API_KEY).replace('countrycode', country_code)
    result = requests.get(url_temp).content

    # Storing and formatting data into a dataframe
    try:
        df_eia = pd.DataFrame(json.loads(result)['response']['data'])
        df_eia = df_eia[['period', 'productName', 'countryRegionName', 'value']]
        df_eia.columns = ['year', 'energy_family', 'country', 'power']
        df_eia['power'] = np.where(df_eia['power'].isin(["NA", '--', 'ie']), np.NaN, df_eia['power'])

        time.sleep(5)

        return df_eia
    
    except:
        print(f'Le code pays "{country_code}" renvoie un résultat "Null".')

    


def get_data(url):

    # Listing country codes
    country_codes = ['ABW', 'AFG', 'AGO', 'ALB', 'ARE', 'ARG', 'ARM', 'ASM', 'ATA', 'ATG', 'AUS', 'AUT', 'AZE', 'BDI', 'BEL', 'BEN', 'BFA', 'BGD', 'BGR', 'BHR', 'BHS',
        'BIH', 'BLR', 'BLZ', 'BMU', 'BOL', 'BRA', 'BRB', 'BRN', 'BTN', 'BWA', 'CAF', 'CAN', 'CHE', 'CHL', 'CHN', 'CIV', 'CMR', 'COD', 'COG', 'COK', 'COL', 'COM',
        'CPV', 'CRI', 'CSK', 'CUB', 'CYM', 'CYP', 'CZE', 'DEU', "DEUW", "DDR", 'DJI', 'DMA', 'DNK', 'DOM', 'DZA', 'ECU', 'EGY', 'ERI', 'ESH', 'ESP', 'EST', 'ETH', 'FIN', 'FJI', 'FLK',
        'FRA', 'FRO', 'FSM', 'GAB', 'GBR', 'GEO', 'GHA', 'GIB', 'GIN', 'GLP', 'GMB', 'GNB', 'GNQ', 'GRC', 'GRD', 'GRL', 'GTM', 'GUF', 'GUM', 'GUY', 'HITZ', 'HKG',
        'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IND', 'IRL', 'IRN', 'IRQ', 'ISL', 'ISR', 'ITA', 'JAM', 'JOR', 'JPN', 'KAZ', 'KEN', 'KGZ', 'KHM', 'KIR', 'KNA', 'KOR',
        'KWT', 'LAO', 'LBN', 'LBR', 'LBY', 'LCA', 'LKA', 'LSO', 'LTU', 'LUX', 'LVA', 'MAC', 'MAR', 'MDA', 'MDG', 'MDV', 'MEX', 'MKD', 'MLI', 'MLT', 'MMR', 'MNE',
        'MNG', 'MNP', 'MOZ', 'MRT', 'MSR', 'MTQ', 'MUS', 'MWI', 'MYS', 'NAM', 'NCL', 'NER', 'NGA', 'NIC', 'NIU', 'NLD', 'NLDA', 'NOR', 'NPL', 'NRU', 'NZL', 'OMN',
        'PAK', 'PAN', 'PER', 'PHL', 'PNG', 'POL', 'PRI', 'PRK', 'PRT', 'PRY', 'PSE', 'PYF', 'QAT', 'REU', 'ROU', 'RUS', 'RWA', 'SAU', 'SCG', 'SDN', 'SEN', 'SGP',
        'SHN', 'SLB', 'SLE', 'SLV', 'SOM', 'SPM', 'SRB', 'SSD', 'STP', 'SUN', 'SUR', 'SVK', 'SVN', 'SWE', 'SWZ', 'SYC', 'SYR', 'TCA', 'TCD', 'TGO', 'THA', 'TJK', 
        'TKM', 'TLS', 'TON', 'TTO', 'TUN', 'TUR', 'TUV', 'TWN', 'TZA', 'UGA', 'UKR', 'URY', 'USA', 'USIQ', 'UZB', 'VCT', 'VEN', 'VGB', 'VIR', 'VNM', 'VUT', 'WAK', 
        'WP13', 'WP14', 'WP15', 'WP16', 'WP17', 'WP18', 'WP25', 'WSM', 'XKS', 'YEM', 'YUG', 'ZAF', 'ZMB', 'ZWE']

    #### Requesting the API ####
    df_eia = pd.concat([api_call(code, url) for code in country_codes])

    return df_eia

