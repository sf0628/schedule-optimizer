# Schedule Optimizing Platform
## Installation

(i need to do this later: pip freeze > requirements.txt)

pip install -r requirements.txt

Run flask in debugger mode:
cd backend/src
flask --app app run --debug

Running on http://127.0.0.1:5000

Run React frontend:
cd frontend
npm install
npm run dev

Running on http://localhost:5173/

Need to get your own credentials:
make this file: backend/src/credentials.json



## Features: 
- [ ] prompting that goes reads calendar information, generates specifications schedule (i.e. no morning classes)
- [ ] allow users to change, alter, delete, or add specifications (use this as reinforcement feedback)
- [ ] feed prompt into ai agent
- [ ] manually inputted schedule request
- [ ] provide suggestions for request (accept/reject, reinforcement)
- [ ] connect to another persons calendar, given language input request, suggest times, dates, and alternatives
- [ ] given patterns in calendar behavior, suggests future schedules (repeat dinners on fridays, etc)
- [ ] email parsing, using npl
- [ ] different calendar integration
- [ ] feed multiple calendars, generate suggestions, based on rules
- [ ] draft emails for scheduling changes/conflicts
- [ ] ai agent to generate events, edit events