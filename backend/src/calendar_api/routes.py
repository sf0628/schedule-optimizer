from flask import Blueprint, jsonify, request
import json
from .service import get_month, create_event
from .supabase_client import client
from .rules import rules_agent
from .embeddings import generate_embeddings
from .confirmation import evaluate_event
from .confirms_bench import evaluate
from utils.utils import split_rules_and_suggestions

calendar_bp = Blueprint("calendar", __name__)

### USER ROUTES ###
@calendar_bp.route("/connect-user", methods=["POST"])
def connect_user():
    data = request.json
    username = data.get("username")
    email = data.get("email")

    if not username or not email:
        return jsonify({"error": "Username and email required"}), 400

    existing = client.table("users").select("*").eq("email", email).execute()
    if existing.data:
        return jsonify({"message": "User already exists", "user_id": existing.data[0]['id']}), 200

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

@calendar_bp.route("/get-username", methods=["GET"])
def get_username():
    data = request.json
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "Missing user_id parameter"}), 400

    result = client.table("users").select("username").eq("id", user_id).execute()

    if not result.data:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"username": result.data[0]["username"]}), 200


@calendar_bp.route("/generate-rules", methods=["POST"])
def generate_rules():

    data = request.json
    user_id = data.get("user_id")
    events = data.get("events")

    if not user_id or not events:
        return jsonify({"error": "Missing user_id or events data"}), 400

    username = client.table("users").select("username").eq("email", user_id).execute()
    print("This is the username")
    print(username)
    username = username.data[0].get("username")

    calendar_name = f"{username}'s Calendar"

    calendar_insert = client.table("calendars").insert({
        # "user_id": user_id,
        "name": calendar_name
    }).execute()


    # if calendar_insert.error:
    if not calendar_insert.data:
        return jsonify({"error": f"Failed to create calendar"}), 500

    calendar_id = calendar_insert.data[0]["id"]

   
    events_json = json.dumps(events)
    generated_rules = rules_agent(events_json)


    calendar_embedding = generate_embeddings(events_json)  
    rules_embedding = generate_embeddings(generated_rules)  

    
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
            "is_accepted": True,  # Default value (can be updated later)
            "correct": True  # Default value (can be updated later)
        }).execute()

        if not event_insert.data:
            return jsonify({"error": f"Failed to insert event: {event.get('id')}"}), 500
        
    # split outputted rules into a structured list
    rules_list = split_rules_and_suggestions(generated_rules)
    print(rules_list)
    
    # Step 6: Return the generated rules and the newly created calendar details
    return jsonify({
        "generated_rules": generated_rules,
        "formatted_rules": rules_list,
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

@calendar_bp.route("/confirm-event", methods=["POST"])
def confirm_event():
    data = request.json
    user_id = data.get("user_id")
    calendar_id = data.get("calendar_id")
    event = data.get("event")

    if not all([user_id, calendar_id, event]):
        return jsonify({"error": "Missing user_id, calendar_id, or event"}), 400

    # 1. Get the most recent rule for the calendar
    rules_result = client.table("rules").select("*").eq("calendar_id", calendar_id).order("version", desc=True).limit(1).execute()
    
    if not rules_result.data:
        return jsonify({"error": "No rules found for calendar"}), 404

    rule = rules_result.data[0]
    rules_text = rule["rules_text"]
    rules_embedding = rule["rules_embedding"]
    rule_id = rule["id"]

    # 2. Generate embedding for the incoming event
    event_embedding = generate_embeddings(json.dumps(event))

    # 3. Run evaluation logic
    try:
        result = evaluate_event(
            event=event,
            rules_embedding=rules_embedding,
            event_embedding=event_embedding,
            current_rule_id=rule_id,
            current_rule_text=rules_text
        )

        event_insert = client.table("events").insert({
            "calendar_id": calendar_id,
            "event_data": event,
            "rule_id": rule_id,  
            "current_rule_version": rule['version'],  
            "accepted_rule_version": rule['version'],  
            "event_embedding": event_embedding,
            "event_type": "user_created",  
            "is_accepted": result["decision"],  
            "correct": False  
        }).execute()

        if not event_insert.data:
            return jsonify({"error": f"Failed to create event"}), 500



        return jsonify({
            "event": event_insert.data,
            "decision": "Accepted" if result["decision"] else "Rejected",
            "reasoning": result.get("reasoning", ""),
        }), 200

    except Exception as e:
        return jsonify({"error": f"Evaluation failed: {str(e)}"}), 500


@calendar_bp.route("/run-confirm-eval", methods=["GET"])
def confirm_eval():
    evaluate()
    return jsonify({"status": "success"}), 500