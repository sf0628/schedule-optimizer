import os
from flask import session, abort

# credenials is at the root directory
def get_credentials_path():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "credentials.json")

# use this decorator before function, after @ thing
def login_is_required(function):
    def wrapper(*args, **kwargs):
        if "google_id" not in session:
            return abort(401) # authorization required
        else:
            return function()
    return wrapper