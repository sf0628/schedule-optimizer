import datetime
from dateutil.relativedelta import relativedelta
import os.path
import json

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# this service.py contains all the functionality to interact with the google calendar api
SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
]

with open('../credentials.json', 'r') as file:
    credentials = json.load(file)

# call the calendar api
def get_service():
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "../credentials.json", SCOPES
            )
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    try:
        return build("calendar", "v3", credentials=creds)
    except HttpError as error:
        print(f"An error occurred: {error}")

# creates an event and adds to the calendar
def create_event(event):
    service = get_service()
    
    event = service.events().insert(calendarId="primary", body=event).execute()

    print(f"Event created {event.get('htmlLink')}")
    return

# gets all previous events within the past month
def get_month():
    service = get_service()
    try:
        now = datetime.datetime.isoformat() + "Z"  # 'Z' indicates UTC time
        month_earlier = (datetime.datetime.now() - relativedelta(months=1)).isoformat() + "Z"
        print(now, month_earlier)
        print("Getting all events from the previous month")
        # change to get 50 the most previous events
        events_result = (
            service.events()
            .list(
                calendarId="primary",
                singleEvents=True,
                orderBy="startTime",
                timeMax=now,
                timeMin=month_earlier
            )
            .execute()
        )
        events = events_result.get("items", [])

        if not events:
            print("No events from the past month found.")
            return

        # Prints the start and name of all events of the past month
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            print(start, event["summary"])
        # Return events
        return events
    except HttpError as error:
        print(f"An error occurred: {error}")

# call calendar function
get_month()