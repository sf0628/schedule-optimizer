from flask import Blueprint, redirect, request, jsonify, make_response
from flask_session import Session
from google_auth_oauthlib.flow import Flow
from dotenv import load_dotenv
import requests
import secrets
from calendar_api.service import get_service, SCOPES
from utils.utils import get_credentials_path
import os

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# load_dotenv()
auth_bp = Blueprint("auth", __name__)

CLIENT_SECRETS_FILE = get_credentials_path()

@auth_bp.route("/status", methods=['GET'])
def auth_status():
    """Check if user is authenticated"""
    if os.path.exists("token.json"):
        return jsonify({"authenticated": True}), 200
    return jsonify({"authenticated": False}), 200

@auth_bp.route("/login/")
def login():
    """Start the OAuth flow"""
    try:
        # url for oauth request
        # state parameter 
        state = secrets.token_urlsafe(16)

        flow = Flow.from_client_secrets_file(
            CLIENT_SECRETS_FILE,
            scopes=SCOPES,
            redirect_uri="http://127.0.0.1:5000/auth/oauth/callback"
        )


        auth_url, _ = flow.authorization_url(
            access_type="offline", #allows refresh access token without re-prompting
            include_granted_scopes="true", #incremental authorization
            prompt="consent",
            state=state,
        )

        response = make_response(redirect(auth_url))
        response.set_cookie(
            'oauth_state', 
            state, 
            max_age=10000000,
            httponly=True,
            samesite='Lax'
        )
        return response
        # return redirect(auth_url)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/oauth/callback")
def oauth_callback():
    """Callback for OAuth flow"""
    try:

        # get state from url and cookies
        state_param = request.args.get('state', '')
        stored_state = request.cookies.get('oauth_state')
        
        print("Cookie state:", stored_state)
        print("URL state param:", state_param)

        if not stored_state:
            return jsonify({"error": "No state cookie found"}), 400
        
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

        response = make_response(redirect("http://localhost:5173/oauth/authorize"))
        response.delete_cookie('oauth_state')
        return response
        # return redirect("http://localhost:5173/oauth/authorize")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route("/email")
def profile():
    """Get email information"""
    try:
        service = get_service("people", "v1")
        if not service:
            return jsonify({"error": "Not authenticated"}), 401
        response = service.people().get(resourceName='people/me', personFields='emailAddresses').execute()
        if not response:
            return jsonify({"error": "Failed to fetch user info"}), 400
        email_addresses = response.get('emailAddresses', [])
        primary_email = next((email['value'] for email in email_addresses if email.get('metadata', {}).get('primary')), None)
        if not primary_email and email_addresses:
            primary_email = email_addresses[0]['value']
        return jsonify({"email": primary_email})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
            

@auth_bp.route("/logout")
def logout():
    """Log out by removing token.json"""
    if os.path.exists("token.json"):
        os.remove("token.json")
    return jsonify({"success": True, "message": "Logged out successfully"}), 200