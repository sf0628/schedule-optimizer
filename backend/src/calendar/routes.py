from flask import Blueprint
import json
from .service import get_month, create_event

calendar_bp = Blueprint("calendar", __name__)

@calendar_bp.route("/month")
def month():
    get_month()

@calendar_bp.route("/add-event/<string:event_data>")
def event(event_data):
    return create_event(json.dumps(event_data))
