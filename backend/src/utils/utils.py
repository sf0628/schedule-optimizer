import os

# credenials is at the root directory
def get_credentials_path():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "credentials.json")