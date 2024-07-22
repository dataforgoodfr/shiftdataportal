
# EMBER (NEW REFERENCE in 2023)
import raw

class Ember_File(raw.File):

    license = ('CC BY-SA 4.0')

    base_url = 'https://ember-climate.org'      
    routes = [        
        # ELEC YEARLY        
        # https://ember-climate.org/data-catalogue/yearly-electricity-data
        # href="/app/uploads/2022/07/yearly_full_release_long_format.csv"
        {'route': '/data-catalogue', 'csv_name':'/elec/all/year', 
            'search_url': '/yearly-electricity-data',     
            'search': 'full_release_long_format*.csv'
        },       
        # ELEC MONTHLY          
        # https://ember-climate.org/data-catalogue/monthly-electricity-data
        # href="/app/uploads/2022/07/monthly_full_release_long_format-4.csv"
        {'route': '/data-catalogue', 'csv_name':'/elec/all/month',
            'search_url': '/monthly-electricity-data',     
            'search': 'full_release_long_format*.csv'
        }, 
        
        # GER YEARLY  
        # https://ember-climate.org/insights/research/global-electricity-review-2023
         # href="/app/uploads/2023/04/release_yearly_ger.csv"
        {'route': '/insights/research', 'csv_name': '/elec/review/global/year',
            'search_url': '/global-electricity-review-' + str(raw.year),     
            'search': 'release_yearly_ger.csv'
        },
        # GER MONTHLY    
        # https://ember-climate.org/insights/research/global-electricity-review-2023
        # href="/app/uploads/2023/04/release_monthly_ger.csv"
        {'route': '/insights/research', 'csv_name': '/elec/review/global/month',
            'search_url': '/global-electricity-review-' + str(raw.year),     
            'search': 'release_monthly_ger.csv'
        },
        
        # EER YEARLY    
        # https://ember-climate.org/insights/research/european-electricity-review-2023
        # href="/app/uploads/2023/01/EER2023-Yearly-Data-1-1.csv"
        {'route': '/insights/research', 'csv_name': '/elec/review/europe/year',
            'search_url': '/european-electricity-review-' + str(raw.year),     
            'search': 'EER' + str(raw.year) +'*Yearly*.csv'
        },
        # EER MONTHLY    
        # https://ember-climate.org/insights/research/european-electricity-review-2023
        # href="/app/uploads/2023/01/EER2023-Monthly-Data-1-1.csv"
        {'route': '/insights/research', 'csv_name': '/elec/review/europe/month',
            'search_url': '/european-electricity-review-' + str(raw.year),     
            'search': 'EER' + str(raw.year) +'*Monthly*.csv'
        }    
    ] 
    
    
def main(raw, test):
    Ember_File().main(raw, test)

    