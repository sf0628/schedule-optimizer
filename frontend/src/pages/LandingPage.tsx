import StartCard from '../components/StartCard';
import { useState } from 'react';

function LandingPage() {
  const [ email, setEmail ] = useState<string>("");

  const handleEmailSubmit = () => {
    console.log("Fake submission works!");
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
          <form id='email-start-form' onSubmit={handleEmailSubmit}>
            <input className='bg-white border-1 border-zinc-300 text-xs p-2 rounded-xs' value={email} placeholder="xyz.example@gmail.com" onChange={e => setEmail(e.target.value)} type="text"/>
            <button className='font-serif bg-green-800 ml-3 p-2 text-white text-xs rounded-4xl' form='email-start-form' type="submit">Connect Calendar</button>
          </form>
          <label>
          </label>
        </div>
        <StartCard />
        
      </div>
    </>
  )
};

export default LandingPage;
