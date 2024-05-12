# SDP Get Interface
# Define abstract methods for creating new source Api or Csv

import os
import requests
import re
from urllib.parse import urlencode
import pandas as pd
import traceback
import utils.download as download
from datetime import datetime
import json
import time

# GLOBAL DEFINITIONS
date = datetime.now()
year = date.year
month = date.month

data_raw = 'data/_raw/'
data_processed = 'data/_processed/'

# ---------------------------------------------------------------------------------------------
# # SDP raw source (Base class)
# ---------------------------------------------------------------------------------------------
class Raw(): 
    
    # Init (may not be the state of art but found more readable)       
    base_url = None
    base_params = None
    
    routes = []
        
    def __init__(self, base_url=None, base_params=None, route=None):
        # Base Url
        ## for api: https://api.eia.gov/v2
        ## for file(s): https://www.iea.org/data-and-statistics/data-sets 
        ## ...      
        self.base_url = base_url or self.__class__.base_url
        # Base url params
        ## {'api_key': ...}
        self.base_params = base_params or self.__class__.base_params or {}
        self.route = route
        
    # ---------------------------------------------------------------------------------------------
    # Public
      
    @classmethod    
    def main(cls, raw, test):
        if test:
            cls._routes()
        elif raw:
            cls.to_raw()    
        else:
            cls.to_processed()  
            
    @classmethod   
    def to_raw(cls):
        # Loop over class level api routes
        base_url = cls.base_url 
        print(f"-- BASE URL: {base_url}")
        for route in cls._routes():
            inst =  cls(base_url, cls.base_params, route)                    
            print(f"\n-- Processing route: {route}")
            inst._raw_to_csv()  
            
    @classmethod   
    def to_processed(cls):
        pass
              
    # ---------------------------------------------------------------------------------------------
    # Private
    
    # Instance Class        
    def _cls(self):
        return type(self)   

    # Instance Class name to lower case        
    def _cls_name(self, csv = False):
        cls_name = self._cls().__name__.lower() 
        if (not csv):
            return cls_name.split('_')[0]
        return cls_name  
        
    @classmethod
    def _routes(cls):
        print(f'\nFound routes: {cls.routes}\n')
        return cls.routes
    
    @classmethod            
    def _route_params(cls, _route):
        return _route.get('route_params') or {}
    
    # Url based on instance properties
    def _get_url(self):
        return self.base_url + ('' if not self.base_params else '?' + urlencode(self.base_params))
    
    # Response data
    def _response_data(self, response, route = None):
        return response.content, route

    # CSV related methods
    def _csv_path(self, raw):
        csv_path = (data_raw if raw else data_processed) + self._cls_name() + '/'
        # Ensure creation of path (need it for dataframe to_csv)
        if not os.path.exists(csv_path):
            os.makedirs(csv_path)
        return csv_path
    
    def _csv_name(self):
        # format csv name
        replace = re.compile('-|/|\s+')
        route = ''
        info=False
        if (self.route is not None) :
            if ('csv_name' in self.route):
                route = self.route['csv_name']
            else:
                route = self.route['route']            
            info = bool(self.route.get('info'))
                
        return ('__info_' if info else '') + (self._cls_name(True) + replace.sub('_', route or '')).lower() 
       
    def _csv_full_name(self, raw=True):
        return self._csv_path(raw) + self._csv_name() + '.csv'
    
    # Default raw to csv via dataframe (_raw_df)
    def _raw_to_csv(self):
        # Raw Csv Output file
        csv_filename = self._csv_full_name(True)
        try:
            # All base route subroutes in same csv
            if 'routes' in self.route:
                df = pd.DataFrame()
                for route in self.route['routes']:
                    cls = self._cls()
                    inst =  cls(cls.base_url, cls.base_params, route)
                    route_df = inst._raw_df()  
                    if route_df is not None:
                        df=pd.concat([df, route_df], ignore_index=True)                     
            else:    
                # Get dataframe
                df = self._raw_df() 
            
            if df is not None and not df.empty: 
                # Ok, backup to raw csv    
                df.to_csv(csv_filename, index=False, encoding='utf-8') 
                if not os.path.exists(csv_filename):
                    raise FileNotFoundError(f"[FATAL] : Csv file not found!")          
            
        except Exception as e:
            print('[ERROR] Raw to csv: ' + csv_filename)
            print('[ERROR] Exception:\n' + str(e))
            traceback.print_exc()
            
    def process_raw_df(self):
        pass            


              
# ---------------------------------------------------------------------------------------------
# # SDP Raw API 
# ---------------------------------------------------------------------------------------------
class Api(Raw):

    # Api default max results per request
    max_results = 10000
    
    max_retries = 1
    retry_delay = 0
       
    # ---------------------------------------------------------------------------------------------
    # Public
 
    # Raw url to raw csv 
    @classmethod   
    def to_raw(cls):
        # Loop over class level api routes
        base_url = cls.base_url 
        print(f"-- API BASE URL: {base_url}")
        for route in cls._routes():
            inst =  cls(base_url, cls.base_params, route)                     
            print(f"\n-- Processing API route: {route}")
            inst._raw_to_csv()    
                 
    
    # ---------------------------------------------------------------------------------------------
    # Private
    # Override method
    @classmethod
    def _routes(cls):
        
        _routes = []  
        # Test first level for the route and deeper if sub routes
        print('-- Analyzing routes, please wait...')
        with requests.Session():
                     
            for route in cls.routes:
                
                if (cls._route_skip_analysis(route)):
                    continue 
                
                # OK, analyze route                                 
                _route = dict(route)
                print(f'... Analysing route : {_route}')                  
                _data, _route =  cls._route_analysis(_route)
            
                if not _route:
                    continue   
                                 
                # We iterate on all groups     
                for group in cls._groups(_route):
                                                            
                    _group = cls._group(_route, group)        
                    _route_routes = cls._group_routes(_route, _group, _data)
                    # Set routes group for the route
                    if (_route_routes):
                        if (bool(_route.get('first'))) :
                            _group =  _route_routes[0]
                        else: 
                            _group['routes'] =  _route_routes 
                    #print(group_route)
                    
                    _routes.append(_group)

                
        print(f'\nFound routes:\n{_routes}')                    
        return _routes 
           
    @classmethod
    def _route_skip_analysis(cls, _route):
        return False
      
    @classmethod
    def _route_analysis(cls, _route):
        return None, _route
          
    @classmethod   
    def _route_path(cls, _route=None):
        return '' if not _route else _route['route']
        
    @classmethod
    def _groups(cls, _route):
        _groups = []
        if 'groups' in _route:            
            _groups =  _route['groups'] 
            _route.pop('groups') 
        return [{}] if not _groups else _groups
    
    @classmethod
    def _group_routes_paths(cls, _route, _group, _data):
        return [] 
         
    @classmethod
    def _group_routes(cls, _route, _group, _data):
        # Get all actual routes for this group                                                              
        _group_routes = []
        for group_path in cls._group_routes_paths(_route, _group, _data):
            
            _group_route = {'route': _route['route'] +'/'+ group_path}
            # We build actual route (existing API route url)                          
            group_route_path = cls._route_path(_group_route)
            print(f'... route path: {group_route_path}')
            #print(f'route _group_route: {_group_route}')
                        
            # Here we can access /data path directly (actual api sub route)
            #response = requests.get(cls.base_url + group_route_path, {**(cls.base_params), **(cls._route_params(_route)), **(cls._group_route_params(_route, _group))})
            #print('!!! response.url' + response.url)
            #sub_route = cls()._response_data(response, _group)[1]
            sub_route = cls()._response(cls.base_url + group_route_path, {**(cls.base_params), **(cls._route_params(_route)), **(cls._group_route_params(_route, _group))} , _group)[1]
            if not sub_route:
                continue  
            
            # Sub route returns results                                                                     
            _group_routes.append({**(sub_route), **(_group_route)})   
            # Test if route params includes 'first' to exit when first non zero dataset is found
            if (bool(_route.get('first'))):
                break
            
        return _group_routes
    
    # Params for the group
    @classmethod
    def _group_route_params(cls, _route, _group):
        return {}

            
    # Group definition
    @classmethod
    def _group(cls, _route, _group):
        _group = _group or {'csv_name' : ''}
        _group_dict = {**(_route),**(_group)}
        if ('csv_name' not in _route):
              _route['csv_name'] = _route['route']                          
        _group_dict['csv_name'] = _route['csv_name']  + _group['csv_name'] 
        print(f'--- route group {_group_dict}\n')    
        return _group_dict 
    
    # Response
    def _response(self, url=None, params=None, route = None):
        if (not url):
            url = self._get_url()
        else:
            url += ('' if not params else '?' + urlencode(params)) 
        
        #print(f'Route URL: {url}') 
        #print(f'Route max retries: {self.max_retries}') 
        #time.sleep(self.retry_delay)     
        retries = 0
        while retries < self.max_retries:
            response = requests.get(url)
            _data, _route = self._response_data(response, dict(route))
            if _data is not None:
                return _data, _route
            
            retries += 1
            delay = self.retry_delay * retries
            if (bool(delay)):
                print(f'Something went wrong. Lets retry after {delay} seconds... please wait...')
                time.sleep(delay)
                    
        return None, None        
                
    # Response data
    def _response_data(self, response, route = None):
        try:
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            print(f"HTTP error {e.response.status_code} ...")
            return None, None
        try:
            data = response.json()              
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return None, None 
        
        if 'error' in data:
            #print('[DEBUG]:\n ' + str(data))
            error = data['error']  
            if type(error) is not dict:
                error = {'code': data['code']  , 'message': error}
            
            # TODO if error['code']=='OVER_RATE_LIMIT'  and retry mechanism  
            #raise Exception('[FATAL] Error ' + str(error['code']) + ': ' + error['message'] ) 
            print(f'[FATAL] Error {error}') 
            return None, None
        
        return data, route                     
    
    # Url based on instance properties
    def _get_url(self):
        route_path = ''
        route_params = {}
        if self.route:
            route_path = self._cls()._route_path(self.route)
            route_params = self.route.get('route_params') or {}
        
        url =  self.base_url + route_path
        params =   {**(self.base_params or {}), **(route_params)}
        return url + ('' if not params else '?' + urlencode(params))    


    # Default raw to dataframe
    def _raw_df(self):
        data = None       
        with requests.Session() as session:
            response = session.get(self._get_url())
            data = self._response_data(response)[0]
           
        if not data: 
            return None
            
        return pd.json_normalize(data)
    
    # Default page data
    def _page_data(self, data):        
        return data    
    
    # Default page params
    def _page_params(self, page):
        pages_params = self.route.get('route_params') or {}
        pages_params['page'] = page + 1
        return pages_params
        
    # Default route page 
    def _page_df(self, session, page):
        
        max_results = self.max_results
        
        offset = page * max_results 
        
        total = self.route['total'] 
        limit = min(total, offset + max_results)    
        print(f'.... {offset + 1} - {limit}')
        
        page_params = self._page_params(page)
            
        self.route['route_params'] = {**(self.route.get('route_params') or {}), **(page_params)}
        
        data = self._response(None, None, self.route)[0]
        if data is not None:                                              
            try :
                page_df = pd.json_normalize(self._page_data(data))
                return page_df
            except Exception as e:
                print('Exception during json normalize for df!!\n' + e)
                #print(json.dumps(data, indent=4))
                
        return None        

    
    # Default raw to dataframe
    def _pages_df(self):
        
        route = self.route 
        if not route:
            return None

        pages_df = pd.DataFrame()
              
        # Test first level fot the route
        with requests.Session() as session:
            
            # Define pages for loop
            max = self.max_results
            print(f'... Processing {route}')
            total = int(route['total'])
            pages = total // max
            if total % max > 0:
                pages += 1
            
            # Pages loop
            for page in range(0, pages):
                page_df = self._page_df(session, page)
                if (not page_df.empty):
                    pages_df = pd.concat([pages_df, page_df], ignore_index=True)  
        
        return pages_df           


# ---------------------------------------------------------------------------------------------
# # SDP Raw FILE(S)
# ---------------------------------------------------------------------------------------------           
# In this first version we will focus on CSV
# We might need to scrap for file links
# TODO OR NOT for other file types

class File(Raw):    
        
    def _pattern(self):
        search = self.route.get('search') or self.route.get('pattern')  or '.csv'
        search = search.replace('.','@@').replace('*','.*').replace('@@','\.')
        return r'^.*' + search + '.*$'     
        
    # Get csv list according to pattern
    def find_files(self, pattern = r'.*\.csv$'):
        with requests.Session() as session:
            # Get response
            response = session.get(self.base_url + self.route['route'] + self.route['search_url'])
            pattern = r'href=["\'](.*?)["\']'
            links = re.findall(pattern, response.text)
            # Filter the links based on the pattern
            filtered_links = [link for link in links if re.match(self._pattern(), link)]
            return filtered_links

    # get The csv url
    def find_file(self):
        the_csv = []
        csvs = self.find_files(self._pattern())
        for csv in csvs:
            if csv in the_csv:
                continue
            the_csv.append(csv)

        if len(the_csv) > 0:
            return the_csv[0]

        return None

    def _get_url(self):
        file_url = self.find_file()
        return self.base_url + file_url     
         
    def _raw_df(self):
        pass
    
    def _raw_to_csv(self):
        download.download_file_with_retry(self._get_url(),self._csv_full_name())
        
        
""" TRACKING TODO
def _raw_df(self, url, pattern):
    csv_url = self._get_url(url, pattern)
    df = None

    if (csv_url is not None):

        # Extract the CSV file name from the URL and remove the file extension
        csv_file_name = os.path.splitext(csv_url.split('/')[-1])[0]

        # Check if the tracking file already exists in the csv sub folder
        track_path = cur_dir + f"/files/.track/.{csv_file_name}"
        last_csv = cur_dir + "/files/cada_pradas_last.csv"

        if os.path.exists(track_path) and os.path.exists(last_csv):
            print(f"The tracking file '{track_path}' already exists.")

        else:
            with requests.Session() as session:
                print(f"Getting csv from url : {csv_url}")
                csv_content = session.get(csv_url).content.decode('utf-8')

            # Save the content of the response to a file
            with open(last_csv, mode='w', encoding='utf-8') as file:
                file.write(csv_content)

            # Create a new blank file with the initial CSV file name to track csv versions
            with open(track_path, 'w'):
                pass

            print(f"The file '{csv_file_name}.csv' has been uploaded to '{last_csv}'.")
            print(f"The tracking file '{track_path}' has been created.")

    if os.path.exists(last_csv):
        df = pd.read_csv(last_csv)


    # print number of rows
    print('CSV dataframe nb rows: '+str(len(df)))
    return df

"""



