from typing import Any
from urllib.parse import urljoin

import pandas as pd
import requests

from sdp_data_preparation.utils import update_url_parameters


class WorldBankEndpoint:
    base_url = "https://api.worldbank.org/v2/"

    def __init__(
            self,
            url: str,
            max_elements: int = 1000,
            response_format: str = "json",
            first_page: int = 1,
    ) -> None:
        if response_format != "json":
            raise ValueError(
                f"You provided '{response_format}' but we don't manage this format yet. "
                f"Please provide 'json' instead."
            )

        self.url = f"{url}?format={response_format}&per_page={max_elements}&page={first_page}"
        self.current_page = first_page
        self.total_pages = first_page
        self.first_page = first_page

    @property
    def full_url(self) -> str:
        return urljoin(base=type(self).base_url, url=self.url)

    def get_response(self) -> Any:
        full_url = self.full_url
        print(f"Calling {full_url}")
        response = requests.get(full_url)
        response.raise_for_status()
        json_response = response.json()

        if self.current_page == self.first_page:
            self.total_pages = json_response[0]["pages"]

        if self.current_page < self.total_pages:
            self.set_next_page()

        return json_response

    def set_next_page(self) -> None:
        self.current_page += 1
        self.url = update_url_parameters(self.url, {"page": [str(self.current_page)]})

    def get_data(self) -> pd.DataFrame:
        # We need to do an initial response to set self.total_pages first
        initial_response = self.get_response()
        dataframes = [pd.json_normalize(initial_response[1])]

        for page in range(self.current_page, self.total_pages + 1):
            response = self.get_response()
            dataframes.append(pd.json_normalize(response[1]))

        return pd.concat(dataframes, ignore_index=True)
