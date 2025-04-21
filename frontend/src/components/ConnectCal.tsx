import { useState } from "react";

interface ConnectCalButtonProps {
    email: string;
    setEmail: (email: string) => void;
    isInvalidEmail: boolean;
    handleEmailSubmit: () => void;
};

function ConnectCalButton({ email, setEmail, isInvalidEmail, handleEmailSubmit } : ConnectCalButtonProps) {

    return (
        <>
            <form id='email-start-form' onSubmit={(e) => {handleEmailSubmit; e.preventDefault();}}>
                <input className='bg-white border-1 border-zinc-300 text-xs p-2 rounded-xs' value={email} placeholder="xyz.example@gmail.com" onChange={e => setEmail(e.target.value)} type="text"/>
                <button className='font-serif bg-green-800 ml-3 p-2 text-white text-xs rounded-4xl' form='email-start-form' type="submit" onClick={() => handleEmailSubmit() }>Connect Calendar</button>
            </form>
            <p className={`text-red-500 text-xs ${isInvalidEmail? "visible" : "invisible"} p-1`}>Invalid email.</p>
        </>
    );
};

export default ConnectCalButton;