
# MAIN FILE FOR SDP
import os
import importlib

# Get the parent path of the current script
cur_path = os.path.dirname(os.path.abspath(__file__))
sources_path = 'sources'
source_modules = []

# Init source modules
# loop through all raw sources in the folder
for module in os.listdir(os.path.join(cur_path, sources_path)):
    # check if the file is a python module
    if module.startswith('raw_') or module.startswith('process_'):
        # extract the module name
        module_name = module[:-3]
        source_modules.append(importlib.import_module(sources_path + '.' + module_name))


def _main(source_list=None, exclude_list=None, raw=True, test=False):
    
    # loop through all raw sources in the folder
    for module in source_modules:
        # Filter sources based on main params
        source=module.__name__.split('_')[1]
        if (not source_list or source in source_list) and (not exclude_list or not source in exclude_list):
            print('\n------------------------------------------------------------------------------------')
            if (test):
                print('\n################################')
                print('## TEST MODE')
                print('################################')
                 
            print('\n-- ' + 'RAW' if raw else 'PROCESS')
            print(f'-- SOURCE NAME: {source.upper()}')

            # Run main method for this source
            module.main(raw, test)       
    
    # if (not test):
    #     import utils.zip as zip
    #     zip.zip(raw)

# Shortcuts
# Get raw data from sources
def raw(source_list=None, exclude_list=None, test=False):
    _main(source_list, exclude_list, True, test)

# Process data from raw csv files
def process(source_list=None, exclude_list=None, test=False):
    _main(source_list, exclude_list, False, test)
    
# Raw AND Process
def all(source_list=None, exclude_list=None, test=False):
    raw(source_list, exclude_list, test)  
    process(source_list, exclude_list, test)     
           
# Default behavior when running this file       
if __name__== "__main__":
    #main(['wb'],['eia'], True, False) 
    #all(['wb'] , [], True) 
    raw(['eia'] , [] ,False)
