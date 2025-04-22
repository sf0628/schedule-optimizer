import { useEffect, useState } from "react";
import useNavigation from "../hooks/useNavigation";
import loaderBlack from "../assets/icons/loader-black.svg";

interface EventsInput {
  user_id: string;
  events: EventData[];
};

// TODO: move into types
export interface EventData {
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
  const { goToCalendar } = useNavigation();
  const [ calID, setCalID ] = useState<string>(import.meta.env.VITE_SOPHIA_GCAL);
  const [ email, setEmail ] = useState<string>();
  const [ rules, setRules ] = useState<string[]>();
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ generateCount, setGenerateCount ] = useState<number>(1);
  const [ error , setError ] = useState<unknown>(null);
  const [ events, setEvents ] = useState<EventsInput>({
    user_id: "",
    events: [],
  });

  // useEffect(() => {
  //   const defaultRules = [
  //     " Classes should not overlap with other scheduled events.",
  //     " Breaks should be scheduled between classes and meetings.",
  //     " Meetings should be scheduled during work hours (9:00 AM to 6:00 PM).",
  //     " Social events can be scheduled in the evenings or weekends.",
  //     " Ensure to leave time for travel between locations.",
  //     " Consider scheduling study sessions or group work during gaps between classes.",
  //     " Avoid scheduling events too close to each other to allow for flexibility and travel time."
  //   ]

  //   setRules(defaultRules);
  //   setLoading(false);
  // }, [])

  // THIS CALLS THE AI MODEL TO GENERATE PROMPTS
  useEffect(() => {
    setLoading(true);
    const fetchAll = async () => {
      try {
        const [emailRes, eventRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/auth/email", {
            credentials: "include"
          }),
          fetch("http://127.0.0.1:5000/calendar/month", {
            credentials: "include"
          })
        ]);

        const emailJson = await emailRes.json();
        const eventJson = await eventRes.json();
  
        setEmail(emailJson["email"]);
        setEvents(eventJson);
      } catch (err) {
        setError(err);
      }
    };
  
    fetchAll();
  }, [generateCount]);

  const handleRegeneration = () => {
    setGenerateCount(generateCount + 1);
  };
  
  useEffect(() => {
    const generateRules = async () => {
      if (!email || !events.events || events.events.length === 0) return;
  
      try {
        const eventsJSON = {
          user_id: email,
          events: events.events,
        };
  
        const response = await fetch("http://127.0.0.1:5000/calendar/generate-rules", {
          method: "POST",
          credentials: 'include',
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventsJSON),
        });
  
        const rulesJSON = await response.json();
        setRules(rulesJSON.formatted_rules);
        setLoading(false);
      } catch (err) {
        setError(err);
      }
    };
  
    generateRules();
  }, [email, events]);
  
  return (
    <div className="">
      {loading && 
        <div className="flex flex-col items-center justify-center mt-0">
          <img src={loaderBlack} alt="Black Loader" className="object-scale-down animate-spin"/>
          <p className="font-serif text-xs font-thin">Waiting for rules to generate!</p>
        </div>
      }
      {!loading &&
        <>
          <h1 className="font-serif text-md">Generated Calendar Rules</h1>
          <div className="flex flex-col items-center justify-start mt-0 mb-10">
            <ul>
              {rules && rules.length > 0 &&
                rules.map((str, index) => (
                  <li key={index}>
                    <p className="font-serif text-sm font-thin my-5">{str}</p>
                  </li>
              ))}
            </ul>
            <div className="flex flex-row justify-around">
              <button className="border border-black rounded-xl py-1 px-2 text-sm hover:text-white hover:border-amber-950 hover:bg-black"
                onClick={handleRegeneration}>
                Regenerate
              </button>
              <button className="font-serif bg-green-800 ml-3 p-2 text-white text-xs rounded-4xl"
                onClick={() => goToCalendar(calID)}> {/* change later */}
                Continue
              </button>
            </div>
          </div>
        </>
      }
    </div>
  );
  
};

export default StartPage;