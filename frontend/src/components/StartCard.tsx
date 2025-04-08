import { useState, useEffect } from "react";
import useNavigation from "../hooks/useNavigation";
import TypingText from "./TypingText";
import clipIcon from "../assets/icons/paperclip.svg";
import calendarJSON from "../assets/data/landing-page.json";

function StartCard() {
    const { goToStart } = useNavigation();
    const [ placeholder, setPlaceHolder ] = useState<string>("");
    const [ calendar, setCalendar ] = useState<string>("");
    const [ suggestions, setSuggestions ] = useState<boolean>(true);

    const handleOnClickSuggestions = () => {
        setSuggestions(true);
    };

    const handleOnClickImport = () => {
        setSuggestions(false);
    };

    useEffect(() => {
        const prettyJSON = JSON.stringify(calendarJSON, null, 2);
        setPlaceHolder(prettyJSON);
    }, []);

    return (
        <div className="flex flex-col justify-between mt-20 border-0 rounded-xl shadow-xl p-5 lg:w-xl md:w-lg w-96 min-h-60">
            <div className="flex flex-row align-middle justify-around pr-1/2 inset-shadow-black">
                <div className="flex flex-col align-middle">
                    <button 
                    className='font-serif border rounded-2xl p-1 border-transparent' 
                    onClick={handleOnClickSuggestions}>
                        Get suggestions
                    </button>
                    <div className={`w-3/4 h-0.5 rounded-3xl mx-auto ${suggestions ? 'bg-black': 'bg-transparent'}`}></div>
                </div>
                <div className="flex flex-col align-middle">
                    <button 
                    className='font-serif border rounded-2xl p-1 border-transparent' 
                    onClick={handleOnClickImport}>
                        Import a calendar
                    </button>
                    <div className={`w-3/4 h-0.5 rounded-3xl mx-auto ${suggestions ? 'bg-transparent': 'bg-black'}`}></div>
                </div>

            </div>
            { suggestions &&
                <TypingText />
            }
            { !suggestions &&
                <>
                    <h1 className="font-serif text-xs" >Copy paste your Google Calendar events here.</h1>
                    <textarea className='bg-white border-1 border-zinc-300 text-xs p-2 rounded-xs text-wrap min-h-25 my-1 overflow-auto break-words' value={calendar} placeholder={placeholder} onChange={e => setCalendar(e.target.value)}/><textarea />
                    <button className="font-serif text-xs flex flex-row justify-start items-center "> <img className="object-scale-down w-3" src={clipIcon} alt="Attachment Icon" />Attach json file</button> 

                </>
            }
            <button className= "font-serif hover:font-bold hover:text-green-900" onClick={ goToStart }>Start optimizing with AI. </button>

        </div>
    )
}

export default StartCard;