import requests
import json

# TODO OR NOT (code will not stay on github)

class Secret:
    
    # Set up authentication headers
    headers = {
        'Authorization': 'Bearer YOUR_GITHUB_PERSONAL_ACCESS_TOKEN',
        'Accept': 'application/vnd.github.v3+json'
    }

    # Set up payload data
    data = {
        'encrypted_value': 'ENCRYPTED_API_KEY',
        'key_id': 'YOUR_GPG_KEY_ID'
    }

    @classmethod
    def set_api_key(cls):
        # Convert data to JSON format
        json_data = json.dumps(cls.data)

        # Make API request to create secret
        response = requests.put(
            'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/actions/secrets/YOUR_SECRET_NAME',
            headers=cls.headers,
            data=json_data
        )

        # Check the status code of the response
        if response.status_code == 201:
            print('Secret created successfully')
        else:
            print('Error creating secret: {}'.format(response.text))
            
            
            