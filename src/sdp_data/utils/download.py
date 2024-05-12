import requests
import time
import csv
import json

def download_file_with_retry(url, file_path, max_retries=1, retry_delay=1):
    retries = 0
    while retries < max_retries:
        with requests.Session() as session:
            try:
                response = session.get(url)
                response.raise_for_status()  # Raise an exception if the request was not successful
                with open(file_path, 'wb') as file:
                    file.write(response.content)
                print("File downloaded successfully.")
                return
            except (requests.RequestException, IOError) as e:
                print(f"An error occurred while downloading the file: {e}")
                retries += 1
                if retries < max_retries:
                    print("Retrying...")
                    time.sleep(retry_delay)
    
    print("Maximum number of retries exceeded. File download failed.")
    
    
def stream_file_to_with_retry(url, file_path, max_retries=1, retry_delay=5):
    retries = 0
    while retries < max_retries:
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()  # Raise an exception if the request was not successful

            with open(file_path, 'w', newline='') as file:
                csv_writer = csv.writer(file)
                for chunk in response.iter_content(chunk_size=1024):
                    if chunk:
                        csv_writer.writerow(chunk.decode().split(','))

            print("CSV data written successfully.")
            return
        except (requests.RequestException, IOError) as e:
            print(f"An error occurred while streaming and appending CSV data to file: {e}")
            retries += 1
            if retries < max_retries:
                print("Retrying...")
                time.sleep(retry_delay)

    print("Maximum number of retries exceeded. Streaming and appending CSV data to file failed.")
    
        
def stream_json_to_csv_with_retry(url, csv_path, max_retries=3, retry_delay=1):
    retries = 0
    while retries < max_retries:
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()  # Raise an exception if the request was not successful
            
            with open(csv_path, 'w', newline='') as csv_file:
                writer = csv.writer(csv_file)
                
                # Assuming the JSON data is a list of dictionaries
                for data_row in response.iter_lines():
                    if data_row:
                        row = json.loads(data_row)
                        writer.writerow(row.values())
            
            print("JSON data streamed to CSV successfully.")
            return
        except (requests.RequestException, IOError) as e:
            print(f"An error occurred while streaming JSON data to CSV: {e}")
            retries += 1
            if retries < max_retries:
                print("Retrying...")
                time.sleep(retry_delay)
    
    print("Maximum number of retries exceeded. Streaming JSON data to CSV failed.")






