import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_session import Session
from auth.routes import auth_bp
from datetime import timedelta
from calendar_api.routes import calendar_bp
from dotenv import load_dotenv


def create_app(test_config=None):
    load_dotenv()
    app = Flask(__name__, instance_relative_config=True)
    
    # Configure session
    app.config.from_mapping(
        SECRET_KEY=os.getenv("SECRET_KEY"),
        SESSION_TYPE='filesystem',
        SESSION_PERMANENT=False,
        SESSION_USE_SIGNER=True,
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    # session times out after one minute
    app.permanent_session_lifetime = timedelta(minutes=1)

    # Load config
    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    Session(app)

    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # Enable CORS
    CORS(app, supports_credentials=True)  # Enable credentials for session cookies

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(calendar_bp, url_prefix="/calendar")

    # Error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Server error"}), 500

    return app

# This allows running the app with `flask run`
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)