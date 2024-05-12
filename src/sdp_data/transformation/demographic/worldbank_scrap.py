import requests
from pandas import json_normalize

class WorldBankScrapper:

    def run(self, indicator):
        
        # select indicator
        if indicator == "population":
            indicator_code = "SP.POP.TOTL"
            value_rename = "population"
        elif indicator == "gdp":
            indicator_code = "NY.GDP.MKTP.CD"
            value_rename = "gdp"

        # Define the World Bank API URL
        url = "https://api.worldbank.org/v2/country/all/indicator/%s?format=json&per_page=20000" % indicator_code
        response = requests.get(url)
        data = response.json()
        assert data[0]["total"] < data[0]["per_page"]

        # clean
        population_data = json_normalize(data[1])
        population_data = population_data[['countryiso3code', 'date', 'country.value', 'value']]
        population_data = population_data.rename(columns={'countryiso3code': 'country_code_a3', 'date': 'year', 'country.value': 'country_name', 'value': value_rename})
        return population_data

