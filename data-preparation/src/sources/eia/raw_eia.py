# EIA API
# https://api.eia.gov/v2/international/data/?frequency=annual&data[0]=value&facets[activityId][]=34&facets[productId][]=4701&facets[countryRegionId][]=WORL&facets[unit][]=BDOLPPP&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=5000

import raw

class Eia_Api(raw.Api):
    
    # API Limit : max results per request
    max_results = 5000
    # API Throttling : max requests per period
    max_retries = 3
    retry_delay = 5
            
    base_url = 'https://api.eia.gov/v2'
    base_params = {        
        # TODO CHANGE IT WITH D4G OR SDP account !!!!!
        # TODO API KEYS MANAGEMENT OR NOT (indeed for EIA we see api_key clearly in url...just log response.url in code!)
        'api_key': '2Em3G72Wor6bHDwuTrjGoVOkKCcjHcHUPbMqZGb1',
        'data[0]': 'value',
        'frequency': 'annual',
        'offset': '0',
        'length': max_results
    }

    routes =[
        {'route': '/international', 'csv_name': '/intl/2020_2021', 'data': True,
         'route_params': {
             'facets': [
                 {'facet': 'countryRegionTypeId', 'value': 'c'}
             ],                           
             'sorts': [
                 {'sort': 'period', 'value': 'desc'}
                 ,{'sort': 'activityId', 'value': 'asc'}
             ]
             ,'start': '2019'
             ,'end': '2022'       
         }
        },
        # {'route': '/ieo', 'csv_name': '/ieo/world', 'first' : True, 
        #  'route_params': {
        #      'facets': [
        #          {'facet': 'regionId', 'value': '0-0'}
        #      ],                           
        #      'sorts': [
        #          {'sort': 'period', 'value': 'desc'}
        #      ]                  
        #  }
        # }
    ]
    
    @classmethod    
    def _route_param(cls, param, index):
        for key in param.keys():
            if key=='facet':
                return [{'key':'facets['+param[key]+'][]', 'value': param['value']}]
            elif key=='sort':
                return [{'key':'sort['+str(index)+'][column]', 'value': param[key]}
                        ,{'key':'sort['+str(index)+'][direction]', 'value': param['value']}]
                     
    @classmethod            
    def _route_params(cls, route):
        _route_params = {}
        route_params = route.get('route_params') or {}
        # print(f'initial route_params: {route_params}')
        for key in route_params.keys():
            if key in ('facets','sorts'):
                params = list(route_params[key])
                # list of facets or sorts
                for param in params:
                    index = 0 
                    # List of actual api route param to include
                    # See _route_param for sort: returns 2 actual api route param definitions
                    for _route_param in cls._route_param(param, index):
                        _route_params[_route_param['key']]=_route_param['value'] 
                        index += 1
            else:
                _route_params[key]=route_params[key]

        # print(f'_route_params: {_route_params}')
        route['route_params']=_route_params                    
        return _route_params    
      
    @classmethod
    def _group_route_params(cls, _route, _group):
        # Lowest per_page (default is 50, 1 not allowed)
        params =  {'length': 1} 
        if (not _group is not None):
            return params
        
        return {**(_group.get('route_params') or {}), **(params)}
       
    @classmethod
    def _group_routes_paths(cls, _route, _group, _data):                       
        # ieo dataset case    
        if 'routes' in _data:  
            sub_routes = _data['routes'] 
            if (sub_routes):
                sub_routes = sorted(sub_routes, key=lambda x: x['id'], reverse=True) 
                group_routes = []
                for sub in sub_routes:
                    group_routes.append(str(sub['id']))
                return group_routes
        return []
    
    @classmethod
    def _route_analysis(cls, _route):
        params = {}
        route_path = _route['route']
        if ('data' in _route and bool(_route['data'])):
            route_path += '/data'
            params = {'length': 1}
                    
        #response = requests.get(cls.base_url + route_path, {**(cls.base_params), **(cls._route_params(_route)), **(params)})
        
        data, _route =  cls()._response(cls.base_url + route_path, {**(cls.base_params), **(cls._route_params(_route)), **(params)}, _route)
        return data, _route
                            
    # Override method
    def _response_data(self, response, route = None):
        
        #print('- Getting response for url: ' +response.url)
        
        data, route = super()._response_data(response , route)
        
        if (data is not None):
            #print(f'route: {route}') 
            #print(f'data: {data}') 

            if 'response' in data:
                # Get interesting data
                data = data['response']
                #print('data: '+ str(data))
                
                if 'total' in data:
                    total = int(data['total'])
                    # Skip this route if total results == 0
                    if not total :
                        # returning data but not route
                        return data, None
                    elif route is not None:
                        route['total'] = total   
                
                return data, route    
        
        #print('Response data: None !!')
        return None, None
    
    
    # Override method
    # Eia specific: /data path added to route to actually get it       
    @classmethod   
    def _route_path(cls, _route=None):
        route_path = super(Eia_Api, cls)._route_path(_route)
        if route_path:
            route_path += '/data'
        return route_path    
    
    # Override method
    def _raw_df(self):
        return self._pages_df()
    
    # Override method
    def _page_params(self, page):
        pages_params = self.route.get('route_params') or {}
        pages_params['offset'] =  page * self.max_results
        return pages_params
    
    # Override method
    def _page_data(self, data):        
        return data['data'] 
    
# --------------------------------------------------------------------------------------------------------                    
def main(raw, test):
    Eia_Api().main(raw, test)
 