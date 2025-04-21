import os

delete_later = "\nRules:\n1. Classes should not overlap and must be scheduled with sufficient breaks in between.\n2. Meetings should be scheduled during the day, preferably before 5 PM.\n3. Lunch breaks should be at least 45 minutes long.\n4. Evening activities should start after 5 PM and should not conflict with the next day's early commitments.\n\nSuggestions:\n1. Ensure that there are no back-to-back meetings without breaks to allow for preparation and travel time.\n2. Consider scheduling social events or personal time on weekends to maintain work-life balance."


# credenials is at the root directory
def get_credentials_path():
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "credentials.json")

# split generated rules output into a list of strings
def split_rules_and_suggestions(text: str) -> list[str]:
    lines = text.strip().split('\n')
    combined = []
    current = ""

    for line in lines:
        if line.strip() == "":
            continue
        if line.strip()[0].isdigit() and line.strip()[1] == ".":
            if current:
                combined.append(current.strip()[2:])
            current = line
    if current:
        combined.append(current.strip()[2:])

    return combined


print(split_rules_and_suggestions(delete_later))