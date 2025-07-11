import os

from sdp_data_preparation import utils
from sdp_data_preparation.world_bank import WorldBankEndpoint

WORLD_BANK_DATA_PATH = os.path.join(utils.get_project_root_path(), "data/world_bank/")

# Population data
population_endpoint = WorldBankEndpoint(url="country/all/indicator/SP.POP.TOTL")
df = population_endpoint.get_data()
dst_filepath = os.path.join(WORLD_BANK_DATA_PATH, "raw_population.csv")
df.to_csv(dst_filepath, index=False)
