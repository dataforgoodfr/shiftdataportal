# WORLDBANK
import pandas as pd
import raw
 
class Wb_Api(raw.Api):
    
    max_results = 21000 # API MAX=32000 but 21000 seems good tradeoff performance/nb results 
    base_url = 'https://api.worldbank.org/v2' 
    base_params = {
        'format': 'json',
        'per_page' : max_results
    } 
        
    routes = [
        # Info data
        {'route': '/regions', 'info': True},
        {'route': '/countries', 'info': True},
        {'route': '/topics', 'info': True},
        {'route': '/sources', 'info': True},
        {'route': '/indicators', 'info': True},
        
        # Actual data
        {'route': '/country/all/indicator', 'csv_name' : '/all',
            'groups': [
                # TODO see with Zeynep
                {'csv_name' : '/pop',  'pattern' : 'SP.POP.TOTL*' },
                {'csv_name' : '/gdp',  'pattern' : 'NY.GDP.MKTP.*'},
                
                # ENERGY/CLIMATE THEMES
                {'csv_name' : '/ghge_sect',  'pattern' : '*GHG*EMSE*'},
                #{'CO2': '*CO2*'},
                #{'USE': '*USE*'},
                
                # KAYA
                # {'GDP_PCAP': 'NY.GDP.PCAP.*'},
                # {'GDP_PUSE': 'EG.GDP.PUSE.*'},
                # ... TODO search for all equation factors (some seem obsolete)                                
            ]
         }
    ]
    
    # Get info dataframe for a particular info route
    @classmethod
    def _info_df(cls, info):
        info_route = next(filter(lambda route: bool(route.get('info')) and route['route'] == '/' + info, cls.routes), None)
        info_inst = cls(cls.base_url, cls.base_params, info_route)
        info_df = pd.read_csv(info_inst._csv_full_name())
        #print(info_df.head())
        return info_df
    
    @classmethod
    def __indicators(cls, search):
        
        df_indicators = cls._info_df('indicators')
        
        # Explode sources
        #df_indicators['source'] = df_indicators['source'].apply(lambda x : dict(eval(x)) )
        #source_exploded = df_indicators['source'].apply(pd.Series).add_prefix('source.')
        #df_indicators = pd.concat([df_indicators.drop('source', axis=1), source_exploded], axis=1)
        
        # Exclude archives = 57
        df_indicators = df_indicators[df_indicators['source.id']!='57']
        
        # Exclude: relative indicators (in %)
        if '.ZS' not in search:
            df_indicators = df_indicators[~df_indicators['id'].str.endswith('.ZS')]    
        if '.ZG' not in search:
            df_indicators = df_indicators[~df_indicators['id'].str.endswith('.ZG')] 
                    
        # Exclude : Found indicator ending with XU.E (ex: Gdp deflator)
        # df_indicators = df_indicators[~df_indicators['id'].str.endswith('.XU.E')]
        
        # Matches pattern        
        search = search.replace('.','@@').replace('*','.*').replace('@@','\.')
        pattern = r'^' + search + '$'
        
        indicators = list(df_indicators.loc[df_indicators['id'].str.contains(pattern), 'id'])

        print(indicators)
        return indicators

    
    # Override method
    @classmethod
    def _group_routes_paths(cls, _route, _group, _data):
        if (bool(_route.get('info'))): 
            return []                      
        return cls.__indicators(_group['pattern'])                        
    
    @classmethod
    def _group_route_params(cls, _route=None, _group=None):
        # Lowest per_page (default is 50, 1 not allowed)
        return {'per_page': 10}
        
    @classmethod
    def _route_skip_analysis(cls, _route):
        #return (bool(_route.get('info')))  
        return False  
               
    @classmethod
    def _route_analysis(cls, _route):
        if ('info' in _route and bool(_route['info'])):
            params = {}
            route_path = _route['route']
            
            params = cls._group_route_params()
                        
            #response = requests.get(cls.base_url + route_path, {**(cls.base_params), **(cls._route_params(_route)), **(params)})
            
            data, _route =  cls()._response(cls.base_url + route_path, {**(cls.base_params), **(cls._route_params(_route)), **(params)}, dict(_route))
            
            inst =  cls(cls.base_url, cls.base_params, _route)                    
            inst._raw_to_csv()  
            return data, None
        else:
            return None, _route
        
    # Override method
    def _response_data(self, response, route = None): 
        #print(f'response.url : {response.url}')      
        data = response.json()
        
        if 'message' in data[0]:
            return None, None
        
        # Ensure we have only one page (all results)
        if 'per_page' in data[0] and (int(data[0]["per_page"]) == self.max_results):
            if int(data[0]["pages"]) > 1:
                raise Exception('ERROR: Several pages found. Should not happen. It is a bug!')
        else:
            if 'total' in data[0]:
                total = int(data[0]['total'])
                # Skip this route if total results == 0
                if not total :
                    return data, None
                else:
                    route['total'] = total   
            
            return data[0], route                  
            
        # Interesting data              
        return data[1], route 
        
    # Override method
    def _raw_df(self):
        return self._pages_df()    
       
#----------------------------------------------------------------
def main(raw, test):
    Wb_Api().main(raw, test)

