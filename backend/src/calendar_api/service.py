import datetime
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
import os.path
import json

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from utils.utils import get_credentials_path

load_dotenv()

# this service.py contains all the functionality to interact with the google calendar api
SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
]

credentials = get_credentials_path()

# call the calendar api
def get_service(type: str, version: str):
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
        # Save the credentials for the next run
            with open("token.json", "w") as token:
                token.write(creds.to_json())
    try:
        service = build(type, version, credentials=creds)
        return service
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None

# creates an event and adds to the calendar
def create_event(event):
    try: 
        service = get_service("calendar", "v3")
        event = service.events().insert(calendarId="primary", body=event).execute()
        print(f"Event created {event.get('htmlLink')}")
        return {"success": True, "htmlLink": event.get("htmlLink")}, 200
    except Exception as e:
        return {"error", str(e)}, 500

# gets all previous events within the past month
def get_month():
    try:
        service = get_service("calendar", "v3")
        sophiaGcal = os.getenv("SOPHIA_GCAL") # TODO: FIX SO THAT TAKES IN INPUT ID
        now = datetime.datetime.now().isoformat() + "Z"  # 'Z' indicates UTC time
        month_earlier = (datetime.datetime.now() - relativedelta(months=1)).isoformat() + "Z"
        print(now)
        print(month_earlier)
        print("Getting all events from the previous month")
        # change to get 50 the most previous events
        events_result = (
            service.events()
            .list(
                calendarId=sophiaGcal, # primary
                singleEvents=True,
                orderBy="startTime",
                timeMax=now,
                timeMin=month_earlier
            )
            .execute()
        )
        events = events_result.get("items", [])

        if not events:
            return {"message": "No events found for the past month"}, 200
        
        return_events = []
        # Prints the start and name of all events of the past month
        # converts to json
        for event in events:
            start = event["start"].get("dateTime", event["start"].get("date"))
            end = event["start"].get("dateTime", event["start"].get("date"))
            return_events.append({
                
                "htmlLink": event.get("htmlLink"),
                "id": event.get("id"),
                "description": event.get("description"),
                "location": event.get("location"),
                "start": start,
                "end": end,
                "status": event.get("status"),
            })
            print(start, event["summary"])

        # Return events
        return {"events": return_events}, 200 
    except HttpError as error:
        return {"error": str(error)}, 500
