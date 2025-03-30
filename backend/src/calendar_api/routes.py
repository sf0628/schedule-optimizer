from flask import Blueprint, jsonify, request
import json
from .service import get_month, create_event

calendar_bp = Blueprint("calendar", __name__)

@calendar_bp.route("/month")
def month():
    # Call the get_month function and return the result as JSON
    result, status_code = get_month()
    return jsonify(result), status_code

@calendar_bp.route("/add-event", methods=["POST"])
def event():
    # Get event data from request body
    event_data = request.json
    if not event_data:
        return jsonify({"error": "No event data provided"}), 400
        
    # Call create_event and return result
    result, status_code = create_event(event_data)
    return jsonify(result), status_code