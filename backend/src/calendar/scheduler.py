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
I want you to become my Personal Calendar Scheduler. Given a Prompt and a Google Calendar Schedule
from the Google Calendar API, respond with these two things:

Accept or Reject a calendar request.

If accepted, provide top three calendar event suggestions. These responses will be in JSON format. Each 
calendar event suggestion should follow the given prompt and have the same location, description, title, etc.
Prompts can be email invites, Google Calendar Event, or text description of invite.

Your response will be one of the following format:
"
Reject 
"

or 
Accept
"
[
  {
    "id": "interview-xyz",
    "summary": "Interview with Candidate",
    "location": "Zoom",
    "description": "Discuss candidate's experience and role expectations.",
    "start": {
      "dateTime": "2025-03-19T12:00:00-05:00",
      "timeZone": "America/New_York"
    },
    "end": {
      "dateTime": "2025-03-19T13:00:00-05:00",
      "timeZone": "America/New_York"
    },
    "attendees": [
      {
        "email": "interviewer@example.com"
      },
      {
        "email": "candidate@example.com"
      }
    ],
    "status": "confirmed"
  },
  {
    "id": "interview-xyz",
    "summary": "Interview with Candidate",
    "location": "Zoom",
    "description": "Discuss candidate's experience and role expectations.",
    "start": {
      "dateTime": "2025-03-21T09:00:00-05:00",
      "timeZone": "America/New_York"
    },
    "end": {
      "dateTime": "2025-03-21T10:00:00-05:00",
      "timeZone": "America/New_York"
    },
    "attendees": [
      {
        "email": "interviewer@example.com"
      },
      {
        "email": "candidate@example.com"
      }
    ],
    "status": "confirmed"
  },
  {
    "id": "interview-xyz",
    "summary": "Interview with Candidate",
    "location": "Zoom",
    "description": "Discuss candidate's experience and role expectations.",
    "start": {
      "dateTime": "2025-03-17T17:30:00-05:00",
      "timeZone": "America/New_York"
    },
    "end": {
      "dateTime": "2025-03-17T18:30:00-05:00",
      "timeZone": "America/New_York"
    },
    "attendees": [
      {
        "email": "interviewer@example.com"
      },
      {
        "email": "candidate@example.com"
      }
    ],
    "status": "confirmed"
  }
]
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

EVENTS_1_EMAIL = """

"""

EVENTS_2_EMAIL = """
Rules:
1. Classes should have gaps for break.
2. Fridays should be class-free for socializing.

Suggestions:
"""

EVENTS_3_EMAIL = """
Rules:
1. Mornings are never free because of stand ups.
2. Typical 9-5 schedule so the day is mainly reserved for work.
3. Schedule accomodates time for hobbies like sewing and thrifting.

Suggestions:
1. Consider having more social events and hangouts since
employees do not have homework.
"""

EVENTS_1_CALENDAR = """
"""

EVENTS_2_CALENDAR = """
"""

EVENTS_3_CALENDAR = """
"""

EVENTS_1_TEXT = """
"""

EVENTS_2_TEXT = """
"""

EVENTS_3_TEXT = """

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
def scheduler_agent(user_query):
    messages = PROMPT_PREFIX + [{"role": "user", "content": user_query}]
    resp = client.chat.completions.create(
        model = MODEL,
        messages=messages,
        temperature=0.2
    ).choices[0].message.content
    messages.append({"role": "assistant", "content": resp})
    print(resp)
    return resp

scheduler_agent(json.dumps(EVENTS_4))