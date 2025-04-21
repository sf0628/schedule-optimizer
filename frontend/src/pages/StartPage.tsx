import { useEffect, useState } from "react";

interface EventsInput {
  user_id: string;
  events: Event[];
};

interface Event {
  description: string;
  end: string;
  htmlLink: string;
  id: string;
  location: string;
  start: string;
  status: string;
  summary: string;
};

function StartPage() {
  const [ email, setEmail ] = useState<string>();
  const [ rules, setRules ] = useState<string[]>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ error , setError ] = useState<unknown>(null);
  const [ events, setEvents ] = useState<EventsInput>({
    user_id: "",
    events: [],
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [emailRes, eventRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/auth/email"),
          fetch("http://127.0.0.1:5000/calendar/month")
        ]);
  
        const emailJson = await emailRes.json();
        const eventJson = await eventRes.json();
  
        setEmail(emailJson["email"]);
        setEvents(eventJson);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };
  
    fetchAll();
  }, []);
  
  useEffect(() => {
    const generateRules = async () => {
      if (!email || !events.events || events.events.length === 0) return;
  
      try {
        const eventsJSON = {
          user_id: email,
          events: events.events,
        };
  
        const response = await fetch("http://127.0.0.1:5000/calendar/generate-rules/", {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventsJSON),
        });
  
        const rulesJSON = await response.json();
        setRules(rulesJSON);
      } catch (err) {
        setError(err);
      }
    };
  
    generateRules();
  }, [email, events]);
  
  return (
    <div className="flex flex-col justify-between items-center min-h-screen bg-orange-50 px-10">
      <ul>
        {rules && rules.length > 0 &&
          rules.map((str, index) => (
            <li key={index}>
              <p>{str}</p>
            </li>
          ))}
      </ul>
    </div>
  );
  
};

export default StartPage;