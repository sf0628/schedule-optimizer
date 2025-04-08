import useNavigation from "../hooks/useNavigation";
import calendarBlack from "../assets/icons/calendar-black.svg";
import calendarBrown from "../assets/icons/calendar-brown.svg";
import gitHub from "../assets/icons/github.svg";

function Header() {
    const { goToLanding, goToLogin, goToDemo, goToFeatures, goToFuture } = useNavigation();

    return (
        <header className="flex flex-row justify-between w-full max-h-10 my-5">
            <div className="relative group w-fit" onClick={ goToLanding }>
                <img src={calendarBlack} alt="Calendar Logo" 
                className="object-scale-down visible group-hover:invisible transition-opacity duration-200"
                />
                <img src={calendarBrown} alt="Calendar Hover Logo"
                className="object-scale-down invisible group-hover:visible absolute top-0 left-0 transition-opacity duration-200"
                />
            </div>
            <nav >
                <ul className="flex flex-row justify-center items-center">
                    <li><button type="button" className="menu-button text px-4" onClick={goToDemo}></button>Demo</li>
                    <li><button type="button" className="menu-button px-4" onClick={goToFeatures}>Features</button></li>
                    <li><button type="button" className="menu-button px-4" onClick={goToFuture}>Future</button></li>
                    <li>
                        <a target="_blank" rel="noopener noreferrer" href="http://github.com/sf0628/schedule-optimizer">
                            <img src={gitHub} alt="GitHub Logo" className="object-scale-down w-4 ml-3 pt-0.5"/>
                        </a>
                    </li>
                </ul>
            </nav>
            <button 
            className="border border-black rounded-xl py-1 px-2 text-sm hover:text-white hover:border-amber-950 hover:bg-black" 
            onClick={ goToLogin }>
                Sign In
            </button>

        </header>
    )
}

export default Header;