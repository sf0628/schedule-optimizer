import { useEffect, useState } from "react";
import useNavigation from "../hooks/useNavigation";

export function LoginPage() {

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

export function AuthCallback() {
    const { goToStart, goToLogin } = useNavigation();

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://127.0.01:5000/auth/status', {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include'
            });

            const data = await response.json();
            console.log("This is authentication status", data)
            if (data.authenticated) {
                setTimeout(goToStart, 1500);
            } else {
                setTimeout(goToLogin, 2000);
            }

        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    };

    return (
        <div className=""></div>
    );
};
