import { useNavigate } from "react-router-dom";

interface useNavigationProps {
    calendarId: string,
}

function useNavigation() {
    const navigate = useNavigate();

    return {
        goToLanding: () => navigate(`/`),
        goToDemo: () => navigate(`/demo`),
        goToFeatures: () => navigate(`/features`),
        goToFuture: () => navigate(`/future`),
        goToStart: (email: string) => navigate(`/start/${email}`),
        goToLogin: () => navigate(`/login`),
        goToNew: () => navigate(`/new`),
        goToCalendars: () => navigate(`/calendars`),
        goToCalendar: (calendarId: string) => navigate(`/calendars/${calendarId}`),
        goToHistory: () => navigate(`/history`),
    };
}

export default useNavigation;