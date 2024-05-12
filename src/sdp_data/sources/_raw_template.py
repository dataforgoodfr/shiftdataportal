# TEMPLATE module for new raw source/provider
# Source name = "source" (ex: eia, iea, ember,...)
# Class name Source_Api and Source_File
import raw
 
class Source_Api(raw.Api):
    
    # Source main attributes
    max_results = 10000
    base_url = 'https://api.source.org' 
    base_params = {}
    
    # Routes List
    # Route Dict info:
    # 'route': an existing api route starting with a leading /
    # 'route_params': dict of params for this route
    # 'data': can directly use data path /data (=False will query metadata instead) for this route
    # 'first': (if not 'data'): when looping for sub routes if any, will stop at first sub routes with results 
    # 'info': this route is only metadata for search   
    routes = [{'route' : '/api_route'}]    



class Source_File(raw.File):
    
    base_url = 'TODO'      

# ---------------------------------------------------------------------------- 
# MAIN  
def main(raw, test):
    Source_Api.main(raw, test)
