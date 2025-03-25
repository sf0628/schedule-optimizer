from flask import Blueprint, redirect, request
from google_auth_oauthlib.flow import Flow

auth_bp = Blueprint("auth", __name__)

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CLIENT_SECRETS_FILE = "credentials.json"

@auth_bp.route("/login")
def login():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:5000/auth/oauth/callback"
    )
    auth_url, _ = flow.authorization_url(prompt="consent")
    return redirect(auth_url)

@auth_bp.route("/oauth/callback")
def oauth_callback():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri="http://localhost:5000/auth/oauth/callback"
    )
    flow.fetch_token(authorization_response=request.url)

    creds = flow.credentials
    with open("token.json", "w") as token:
        token.write(creds.to_json())

    return redirect("http://localhost:5173/oauth/authorize")