import { useEffect, useState } from "react";

function LoginPage() {
    
    const handleLogin = () => {
        window.location.href = 'http://127.0.0.1:5000/auth/login';
    };
    
    return (
        <>
            <p>Login with Google!</p>
            <button onClick = {handleLogin}>Login</button>
        </>
    )
};

export default LoginPage;