from flask import Blueprint, redirect, request, jsonify, session
from flask_session import Session
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv

from utils.utils import get_credentials_path
import os

load_dotenv()
auth_bp = Blueprint("auth", __name__)

SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events"
]

CLIENT_SECRETS_FILE = get_credentials_path()

@auth_bp.route("/status")
def auth_status():
    """Check if user is authenticated"""
    if os.path.exists("token.json"):
        return jsonify({"autheticated": True}, status=200)
    return jsonify({"authenticated": False}, status=200)

@auth_bp.route("/login")
def login():
    """Start the OAuth flow"""
    try:
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri="http://127.0.0.1:5000/auth/oauth/callback"
        )
        # url for oauth request
        # state parameter 
        state = os.urandom(16).hex()
        session['state'] = state

        auth_url, _ = flow.authorization_url(
            access_type="offline", #allows refresh access token without re-prompting
            include_granted_scopes="true", #incremental authorization
            prompt="consent",
        )
        return redirect(auth_url)
    except Exception as e:
        return jsonify({"error": str(e)}, status=500)

@auth_bp.route("/oauth/callback")
def oauth_callback():
    """Callback for OAuth flow"""
    try:
        if "state" not in session:
            return jsonify({"error": "State verification failed"}), 400
        
        # get state
        state_param = request.args.get('state', '')
        stored_state = session['state']
        
        if state_param != stored_state:
            return jsonify({"error": "State parameter doesn't match stored state"}), 400
        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri="http://127.0.0.1:5000/auth/oauth/callback"
        )

        # get credentials with authorization code from callback
        flow.fetch_token(authorization_response=request.url)

        # save creds to token.json
        creds = flow.credentials
        with open("token.json", "w") as token:
            token.write(creds.to_json())

        return redirect("http://localhost:5173/oauth/authorize")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/logout")
def logout():
    """Log out by removing token.json"""
    if os.path.exists("token.json"):
        os.remove("token.json")
    return jsonify({"success": True, "message": "Logged out successfully"}), 200