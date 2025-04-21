import StartCard from '../components/StartCard';
import ConnectCalButton from '../components/ConnectCal';
import { useState } from 'react';
import useNavigation from '../hooks/useNavigation';
import useAuth from '../hooks/useAuth';

function LandingPage() {
  const [ email, setEmail ] = useState<string>("");
  const [ invalidEmail, setInvalidEmail ] = useState<boolean>(false); // false if valid
  const { goToStart, goToLogin } = useNavigation();
  const { validateEmail, checkAuthStatus } = useAuth();

  const handleConnectUser = async () => {
    const response = await fetch("http://127.0.0.1:5000/calendar/connect-user", {
      method: "POST",
      headers: {
        "Conect-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({username: email, email: email})

    }).catch(error => {
      console.log(error);
    });
  };

  const handleEmailSubmit = async () => {
    const status = await checkAuthStatus();
    const emailValidation = validateEmail(email);
    if (!emailValidation) {
      setInvalidEmail(true);
    } else if (status && !invalidEmail) {
      handleConnectUser();
      goToStart();
    } else {
      handleConnectUser();
      goToLogin();
    }
    console.log("Submission redirected.");
  };
  
  return (
    <>
      <div className="flex flex-col justify-start items-center min-h-screen px-10 mh-20">
        <div className="flex flex-col justify-center items-center lg:max-w-5/10 md:max-w-7/10 sm:max-w-9/10">
          <h1 className='font-serif text-5xl text-center '>Optimize your calendar with our AI-Powered tools!</h1>
          <p className='font-serif text-sm text-center font-thin my-5'>
            This is how you can use our application. Insert blurb here. Add details. 
            Continue this and make it more interesting. Add more text. Yes even more text. This is an extremely 
            long and interesting paragraph full of everything you ever need in the world.
          </p>
          <ConnectCalButton email={email} setEmail={setEmail} isInvalidEmail={invalidEmail} handleEmailSubmit={handleEmailSubmit} />
        </div>
        <StartCard />
        
      </div>
    </>
  )
};

export default LandingPage;
