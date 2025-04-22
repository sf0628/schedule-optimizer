import os

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