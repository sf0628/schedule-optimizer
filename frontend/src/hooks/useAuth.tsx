
function useAuth() {

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/status', {
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: 'include',
            });

            const data = await response.json();
            console.log("This is authentication status", data);
            return data.authenticated;
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    };

    const validateEmail = (email: string) => {
        return String(email)
            .toLowerCase()
            .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    const getProfileInfo = async () => {
        try {
            const response = await fetch('http://127.0.1:5000/auth/profile', {
                credentials: 'include'
            });

            const profile = await response.json();
            return profile;
        } catch (error) {
            console.error('Error retrieving profile information.');
        }
    };

    return {
        checkAuthStatus,
        validateEmail,
        getProfileInfo,
    };
};

export default useAuth;