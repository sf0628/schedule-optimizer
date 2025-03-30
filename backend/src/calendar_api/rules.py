import os
import json
import openai
from dotenv import load_dotenv

load_dotenv()

MODEL = "llama3p1-8b-instruct"

client = openai.OpenAI(
    api_key = "fu.so@northeastern.edu:03712",
    base_url = "https://nerc.guha-anderson.com/v1"
)

SYSTEM_PROMPT = """
I want you to become my Expert Prompt Creator. Only answer with a list of rules and preferences about 
a calendar schedule from the Google Calendar API.

These responses will be used to have a better understanding of patterns within a users schedule.
The purpose is to prompt make suggestions for when new event requests are made
Longer calendar schedules should have more rules and suggests.

Your response will be in the following format:

"
Rules:
1. Meetings should not overlap.
2. Breaks of at least 15 minutes should be scheduled between meetings longer than 1 hour.
3. Work hours are from 9:00 AM to 6:00 PM.
4. No meetings should be scheduled before 10:00 AM on Mondays.
5. Lunch breaks should be scheduled between 12:00 PM and 1:30 PM.
6. Recurring meetings should follow a consistent pattern (e.g., every Monday at 3:00 PM).
7. Personal time should be blocked out to avoid conflicts with work.

Exceptions:
1. Fridays are remote. More flexibility for events.
2. Morning meetings are prefered on Fridays.
3. Exceptions are okay for important events, personal or professional.
"

"""

with open('../events/events_1.json', 'r') as file:
    EVENTS_1 = json.load(file)

with open('../events/events_2.json', 'r') as file:
    EVENTS_2 = json.load(file)

with open('../events/events_3.json', 'r') as file:
    EVENTS_3 = json.load(file)

with open('../events/events_4.json', 'r') as file:
    EVENTS_4 = json.load(file)

EVENTS_1_RULES = """
Rules:
1. Classes should be back to back and in the mornings.
2. Lunch time should be set aside for breaks and socialization.
3. Meetings should be in the evenings.
4. Social events and hangouts are usually reserved for the weekends.

Suggestions:
1. Gym workouts can be skipped if there is an important meeting or deadline.
"""

EVENTS_2_RULES = """
Rules:
1. Classes should have gaps for break.
2. Fridays should be class-free for socializing.

Suggestions:
"""

EVENTS_3_RULES = """
Rules:
1. Mornings are never free because of stand ups.
2. Typical 9-5 schedule so the day is mainly reserved for work.
3. Schedule accomodates time for hobbies like sewing and thrifting.

Suggestions:
1. Consider having more social events and hangouts since
employees do not have homework.
"""

USER_PREFIX = "Parse this calendar: "

PROMPT_PREFIX = [
    { "role": "system", "content": SYSTEM_PROMPT },
    # Example 1
    { "role": "user", "content": USER_PREFIX + json.dumps(EVENTS_1)},
    { "role": "assistant", "content": EVENTS_1_RULES },

    # Example 2
    { "role": "user", "content": USER_PREFIX + json.dumps(EVENTS_2)},
    { "role": "assistant", "content": EVENTS_2_RULES },

    # Examples 3
    { "role": "user", "content": USER_PREFIX + json.dumps(EVENTS_3)},
    { "role": "assistant", "content": EVENTS_3_RULES }
]

# define calendar rules
def rules_agent(user_query):
    messages = PROMPT_PREFIX + [{"role": "user", "content": user_query}]
    resp = client.chat.completions.create(
        model = MODEL,
        messages=messages,
        temperature=0.2
    ).choices[0].message.content
    messages.append({"role": "assistant", "content": resp})
    print(resp)
    return resp

rules_agent(json.dumps(EVENTS_4))