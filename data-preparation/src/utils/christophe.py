

   
###########################################################################################################
# BACKUP CODE CHRISTOPHE
import io
import zipfile

import pandas as pd
import requests
from sqlalchemy import create_engine

# EASY WAY TO POSTGRE
def christophe():
    url = "https://api.worldbank.org/v2/en/indicator/'SP.POP.TOTL?downloadformat=csv"
    output_csv = "API_'SP.POP.TOTL_DS2_en_csv_v2_5436324.csv"
    response = requests.get(url)
    zip_file = zipfile.ZipFile(io.BytesIO(response.content))
    csv_file = zip_file.open(output_csv)
    df = pd.read_csv(csv_file, skiprows=4)
    df = df.filter(regex='^(?!Unnamed)')
    df = df.drop(columns=["Indicator Name", "Indicator Code"])
    df = df.melt(id_vars=["Country Code", "Country Name"], var_name="Year", value_name="Population")
    postgres_url = "postgresql://..."  # To fill with a valid postgresql
    engine = create_engine(postgres_url)
    with engine.begin() as conn:
        df.to_sql("worldbank_population", conn, if_exists="replace", index=False)
        