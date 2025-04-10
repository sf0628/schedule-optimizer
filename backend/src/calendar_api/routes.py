from flask import Blueprint, jsonify, request
import json
from .service import get_month, create_event
from .supabase_client import client
from .rules import rules_agent
from .embeddings import generate_embeddings

calendar_bp = Blueprint("calendar", __name__)

### USER ROUTES ###
@calendar_bp.route("/connect-user", methods=["POST"])
def connect_user():
    data = request.json
    username = data.get("username")
    email = data.get("email")

    if not username or not email:
        return jsonify({"error": "Username and email required"}), 400

    # Check if user already exists
    existing = client.table("users").select("*").eq("email", email).execute()
    if existing.data:
        return jsonify({"message": "User already exists", "user_id": existing.data[0]['id']}), 200

    # Otherwise, create new user
    new_user = client.table("users").insert({
        "username": username,
        "email": email
    }).execute()

    if new_user.data:
        return jsonify({"message": "User created", "user_id": new_user.data[0]['id']}), 201
    else:
        return jsonify({"error": "Failed to create user"}), 500


@calendar_bp.route("/get-user", methods=["GET"])
def get_user():
    data = request.json
    # username = data.get("username")
    email = data.get("email")

    # email = request.args.get("email")

    if not email:
        return jsonify({"error": "Missing email parameter"}), 400

    result = client.table("users").select("id").eq("email", email).execute()

    if not result.data:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user_id": result.data[0]['id']}), 200

@calendar_bp.route("/generate-rules", methods=["POST"])
def generate_rules():
    # Get input data from the request body
    data = request.json
    
    # Extract user_id and events
    user_id = data.get("user_id")
    events = data.get("input", {}).get("events")

    if not user_id or not events:
        return jsonify({"error": "Missing user_id or events data"}), 400

    # Generate the calendar name (you can customize this as needed)
    calendar_name = f"{user_id}'s Calendar"

    # Step 1: Add the new calendar to the `calendars` table
    calendar_insert = client.table("calendars").insert({
        "user_id": user_id,
        "name": calendar_name
    }).execute()

    print(calendar_insert)

    # if calendar_insert.error:
    if not calendar_insert.data:
        return jsonify({"error": f"Failed to create calendar"}), 500

    calendar_id = calendar_insert.data[0]["id"]

    # Step 2: Generate rules for the calendar using the existing rule generation function
    events_json = json.dumps(events)
    generated_rules = rules_agent(events_json)

    # Step 3: Generate embeddings for the rules and the calendar
    calendar_embedding = generate_embeddings(events_json)  # Custom function to generate the calendar embedding
    rules_embedding = generate_embeddings(generated_rules)  # Custom function to generate the rules embedding

    # Step 4: Insert the generated rules into the `rules` table
    rules_insert = client.table("rules").insert({
        "calendar_id": calendar_id,
        "version": 1,  # Set initial version to 1
        "rules_text": generated_rules,
        "rules_embedding": rules_embedding,
        "calendar_embedding": calendar_embedding
    }).execute()

    if not rules_insert.data:
        return jsonify({"error": "Failed to create rules"}), 500

    rules_id = rules_insert.data[0]["id"]

    # Step 5: Insert each event into the `events` table with the `rules_id` and `calendar_id`
    for event in events:
        event_data = json.dumps(event)  # Store the event data as JSON
        event_embedding = generate_embeddings(event_data)  # Generate event embedding
        
        event_insert = client.table("events").insert({
            "calendar_id": calendar_id,
            "event_data": event_data,
            "rule_id": rules_id,  # Link the event to the generated rules
            "current_rule_version": 1,  # Set initial rule version
            "accepted_rule_version": 1,  # Set initial accepted rule version
            "event_embedding": event_embedding,
            "event_type": "imported",  # Mark as a generated event
            "is_accepted": False,  # Default value (can be updated later)
            "correct": True  # Default value (can be updated later)
        }).execute()

        if not event_insert.data:
            return jsonify({"error": f"Failed to insert event: {event.get('id')}"}), 500

    # Step 6: Return the generated rules and the newly created calendar details
    return jsonify({
        "generated_rules": generated_rules,
        "calendar_id": calendar_id,
        "status": "success"
    }), 201

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