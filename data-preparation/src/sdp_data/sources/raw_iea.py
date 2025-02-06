#IEA : 
import raw

class Iea_Api(raw.Api):
    # No LICENCE nor REFERENCE (might become obsolete)
    # Url found by chance !! Might disappear !!
    license = ('UNKNOWN')
    base_url = 'https://api.iea.org'      
    routes = [{'route' : '/eei-explorer', 'csv_name': '/eei'}]    


# TODO: implement? SDP LICENSE FOR FREE RESOURCE HAS TO BE CC-BY-NC-SA (some CC-BY 4.0 but not for datasets, only reports)
# See https://www.iea.org/terms
class Iea_File(raw.File):
    
    license = ('CC BY-NC-SA 4.0')
    base_url = 'https://www.iea.org'      
    routes = [
        # TODO OR NOT?
    ] 

#----------------------------------------------------------------
def main(raw, test):
    Iea_Api().main(raw, test)
    