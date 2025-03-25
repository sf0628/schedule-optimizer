import os
from flask import Flask
from flask_cors import CORS
from auth.routes import auth_bp
from calendar.routes import calendar_bp

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

def create_app(test_config=None):
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    CORS(app)  # Enable CORS if needed

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(calendar_bp, url_prefix="/calendar")

    @app.route('/')
    def hello():
        return "<p>hello</p>"

    return app
