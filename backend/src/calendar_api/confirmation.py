import json
import openai
from dotenv import load_dotenv
from .supabase_client import client
from .embeddings import generate_embeddings
import re

load_dotenv()

MODEL = "gpt-4o-mini"

client_ai = openai.OpenAI(
    api_key = "fu.so@northeastern.edu:03712",
    base_url = "https://nerc.guha-anderson.com/v1"
)

SYSTEM_PROMPT = """
You are an expert calendar assistant. 
Given an event and scheduling rules, determine if the event should be accepted or rejected. 
Only answer with a response stating the decision. 

These responses will be used to have a better understanding of patterns within a users schedule.
The decision should follow the rules but can be flexible with the given suggestions.

Your response will be in the following format:

"
Decision:
Accept this event.

"

OR

"
Decision:
Reject this event.

"
"""

USER_PREFIX = f"Accept or Reject this event based on its rules: \n"


#gets similar rules
def fetch_similar_rules(rule_embedding, current_rule_id, top_k=2 ):
    response = client.rpc("match_rules_by_embedding", {
        "query_embedding": rule_embedding,
        "match_count": top_k
    }).execute()

    similar_rules = [r for r in response.data if r["id"] != current_rule_id]
    return similar_rules

# gets events from similar rules and the current rule
def fetch_similar_events(event_embedding, similar_rule_ids, current_rule_id, top_k=2):
    response = client.rpc("match_events_by_embedding", {
        "query_embedding": event_embedding,
        "match_count": top_k
    }).execute()

    similar_events = [e for e in response.data if e["rule_id"] in similar_rule_ids or e["rule_id"] == current_rule_id]
    return similar_events

# created a prompt --> do we want to include the prompt prefix in case there are no similar events
def build_decision_prompt(event, current_rule_text, similar_rule_event_pairs):
    prompt = [
        { "role": "system", "content": SYSTEM_PROMPT }
    ]

    for pair in similar_rule_event_pairs:
        rule_text = pair["rule_text"]
        event_data = pair["event_data"]
        decision = pair["decision"]  # bool

        user_content = (
            USER_PREFIX +
            f"Rule:\n{rule_text}\n\nEvent:\n{json.dumps(event_data, indent=2)}"
        )
        assistant_content = f"Decision:\n{'Accept' if decision else 'Reject'} this event.\n"

        prompt.append({ "role": "user", "content": user_content })
        prompt.append({ "role": "assistant", "content": assistant_content })

    prompt.append({
        "role": "user",
        "content": (
            USER_PREFIX +
            f"Rule:\n{current_rule_text}\n\nEvent:\n{json.dumps(event, indent=2)}"
        )
    })
    print(prompt)

    return prompt


def evaluate_event(event, rules_embedding, event_embedding, current_rule_id, current_rule_text):
    similar_rules = fetch_similar_rules(rules_embedding, current_rule_id)
    similar_rule_ids = [r['id'] for r in similar_rules]

    similar_events = fetch_similar_events(event_embedding, similar_rule_ids, current_rule_id)

    rule_lookup = {r['id']: r['rules_text'] for r in similar_rules}
    rule_lookup[current_rule_id] = current_rule_text  

    # Attach rule_text and flag if from current_rule_id
    annotated_events = []
    for e in similar_events:
        rule_id = e['rule_id']
        rule_text = rule_lookup.get(rule_id)
        if rule_text and e['is_accepted'] is not None:
            annotated_events.append({
                "rule_text": rule_text,
                "event_data": e["event_data"],
                "decision": e["is_accepted"],
                "from_current_rule": rule_id == current_rule_id
            })


    annotated_events.sort(key=lambda x: not x["from_current_rule"]) 

    rule_event_pairs = annotated_events[:4]

    prompt = build_decision_prompt(event, current_rule_text, rule_event_pairs)

    result = client_ai.chat.completions.create(
        model=MODEL,
        messages=prompt,
        temperature=0.2
    ).choices[0].message.content

    match = re.search(r"Decision:\s*(Accept|Reject)", result, re.IGNORECASE)
    decision = match.group(1).lower() == "accept" if match else False

    return {
        "decision": decision,
        "reasoning": result
    }