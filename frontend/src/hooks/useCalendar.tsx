
function useCalendar() {

    const generateRules = async () => {
        try {
            const response = await fetch('http://127.0.01:5000/calendar/profile', {
                credentials: 'include'
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error generating rules', error);
        }
    };

    return {
        generateRules,
    };
};

export default useCalendar;