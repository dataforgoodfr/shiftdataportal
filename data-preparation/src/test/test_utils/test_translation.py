import unittest

import numpy as np
import pandas as pd
from src.utils.translation import CountryTranslatorFrenchToEnglish


class TestCountryTranslatorFrenchToEnglish(unittest.TestCase):

    def test_translation_with_valid_data(self):
        """
        Test the standard case with vali data only.
        :return:
        """
        # given valid english countries
        serie_in = pd.Series(["Uzbekistan", "Ouzbékistan", "Venezuela, Bolivarian Republic of"])

        # when translating the names
        serie_out = CountryTranslatorFrenchToEnglish().run(serie_in, raise_errors=False)

        # expect complete translation
        serie_exp = pd.Series(["Uzbekistan", "Uzbekistan", "Venezuela"])

        self.assertTrue(serie_out.equals(serie_exp))

    def test_translation_with_unknown_countries(self):
        """
        Test the standard case with vali data only.
        :return:
        """
        # given valid english countries
        serie_in = pd.Series(["Uzbekistan", "Ouzbékistan", "AZERTYUI"])

        # when translating the names
        serie_out = CountryTranslatorFrenchToEnglish().run(serie_in, raise_errors=False)

        # expect complete translation
        serie_exp = pd.Series(["Uzbekistan", "Uzbekistan", np.nan])

        self.assertTrue(serie_out.equals(serie_exp))

