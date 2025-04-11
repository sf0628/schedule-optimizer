import React, { useState, useEffect } from 'react';
import GoogleCalendar from '../components/GoogleCalendar';

// Google API interfaces
interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
  location?: string;
  creator?: {
    email: string;
    displayName?: string;
  };
}

interface EventModalData {
  id?: string;
  summary: string;
  description: string;
  location: string;
  startDateTime: string;
  endDateTime: string;
  colorId: string;
}

// Component for calendar page
const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [eventModalData, setEventModalData] = useState<EventModalData>({
    summary: '',
    description: '',
    location: '',
    startDateTime: '',
    endDateTime: '',
    colorId: '1'
  });
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Check if user is authenticated with Google
  useEffect(() => {
    // Mock authentication check - in real app, check if Google Auth token exists
    const hasToken = localStorage.getItem('googleAuthToken');
    setIsAuthenticated(!!hasToken);
  }, []);

  // Handle Google Calendar API authentication
  const handleAuthenticate = () => {
    // In a real app, this would initiate Google OAuth2 flow
    console.log("Initiating Google authentication...");
    
    // Mock successful authentication
    localStorage.setItem('googleAuthToken', 'mock-token');
    setIsAuthenticated(true);
    
    // Fetch events after authentication
    fetchCalendarEvents(new Date(), new Date(new Date().setMonth(new Date().getMonth() + 1)));
  };

  // Format date for Google Calendar API
  const formatDateForApi = (date: Date): string => {
    return date.toISOString();
  };

  // Fetch calendar events from Google Calendar API
  const fetchCalendarEvents = async (startDate: Date, endDate: Date) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an actual API call to Google Calendar API
      console.log(`Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Mock API response with sample data
      setTimeout(() => {
        const mockEvents: GoogleCalendarEvent[] = generateMockEvents(startDate, endDate);
        setEvents(mockEvents);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock events for demo purposes
  const generateMockEvents = (startDate: Date, endDate: Date): GoogleCalendarEvent[] => {
    const events: GoogleCalendarEvent[] = [];
    const today = new Date();
    
    // Meeting event
    events.push({
      id: '1',
      summary: 'Team Standup',
      description: 'Daily team standup meeting',
      start: {
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 30).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      colorId: '1',
      location: 'Conference Room A',
      creator: {
        email: 'manager@example.com',
        displayName: 'Team Manager',
      },
    });
    
    // Lunch event
    events.push({
      id: '2',
      summary: 'Lunch with Client',
      description: 'Discuss project timeline and requirements',
      start: {
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 13, 30).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      colorId: '10',
      location: 'Downtown Café',
      creator: {
        email: 'you@example.com',
      },
    });
    
    // Tomorrow event
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    events.push({
      id: '3',
      summary: 'Project Deadline',
      description: 'Submit final deliverables',
      start: {
        dateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 15, 0).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 16, 0).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      colorId: '4',
      creator: {
        email: 'you@example.com',
      },
    });
    
    // Next week event
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    events.push({
      id: '4',
      summary: 'Quarterly Review',
      description: 'Review quarterly goals and achievements',
      start: {
        dateTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 10, 0).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 11, 30).toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      colorId: '9',
      location: 'Main Conference Room',
      creator: {
        email: 'ceo@example.com',
        displayName: 'CEO',
      },
    });
    
    return events;
  };

  // Color mapping from Google Calendar colorIds to actual colors
  const COLOR_MAP: { [key: string]: string } = {
    '1': '#7986CB', // Lavender
    '2': '#33B679', // Sage
    '3': '#8E24AA', // Grape
    '4': '#E67C73', // Flamingo
    '5': '#F6BF26', // Banana
    '6': '#F4511E', // Tangerine
    '7': '#039BE5', // Peacock
    '8': '#616161', // Graphite
    '9': '#3F51B5', // Blueberry
    '10': '#0B8043', // Basil
    '11': '#D50000', // Tomato
    'default': '#4285F4', // Default blue
  };

  // Handle event click
  const handleEventClick = (event: any) => {
    // Open modal with event data for editing
    setModalMode('edit');
    
    const startDateTime = new Date(event.date);
    const [startHours, startMinutes] = event.start.split(':').map(Number);
    startDateTime.setHours(startHours, startMinutes);
    
    const endDateTime = new Date(event.date);
    const [endHours, endMinutes] = event.end.split(':').map(Number);
    endDateTime.setHours(endHours, endMinutes);
    
    // Find color ID from color
    const colorId = Object.entries(COLOR_MAP).find(([id, color]) => 
      color === event.color
    )?.[0] || '1';
    
    setEventModalData({
      id: event.id,
      summary: event.title,
      description: event.description || '',
      location: event.location || '',
      startDateTime: startDateTime.toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
      endDateTime: endDateTime.toISOString().slice(0, 16),
      colorId: colorId
    });
    
    setShowEventModal(true);
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    // Open modal with default data for creating new event
    setModalMode('create');
    
    // Set default time to the clicked hour or current time if not specified
    const startTime = new Date(date);
    const endTime = new Date(date);
    endTime.setHours(endTime.getHours() + 1);
    
    setEventModalData({
      summary: '',
      description: '',
      location: '',
      startDateTime: startTime.toISOString().slice(0, 16),
      endDateTime: endTime.toISOString().slice(0, 16),
      colorId: '1'
    });
    
    setShowEventModal(true);
  };

  // Save event to Google Calendar
  const handleSaveEvent = async () => {
    if (!eventModalData.summary) {
      alert('Event title is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an actual API call to Google Calendar API
      const eventData = {
        summary: eventModalData.summary,
        description: eventModalData.description,
        location: eventModalData.location,
        start: {
          dateTime: new Date(eventModalData.startDateTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(eventModalData.endDateTime).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: eventModalData.colorId,
      };
      
      console.log(`${modalMode === 'create' ? 'Creating' : 'Updating'} event:`, eventData);
      
      // Mock API success
      setTimeout(() => {
        // Refresh events after successful save
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2);
        
        fetchCalendarEvents(startDate, endDate);
        
        // Close modal
        setShowEventModal(false);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete event from Google Calendar
  const handleDeleteEvent = async () => {
    if (!eventModalData.id) return;
    
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an actual API call to Google Calendar API
      console.log(`Deleting event: ${eventModalData.id}`);
      
      // Mock API success
      setTimeout(() => {
        // Refresh events after successful delete
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 2);
        
        fetchCalendarEvents(startDate, endDate);
        
        // Close modal
        setShowEventModal(false);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-start items-center min-h-screen px-10 mh-20">
      <div className="flex flex-col justify-center items-center lg:max-w-5/10 md:max-w-7/10 sm:max-w-9/10">
        <h1 className="font-serif text-5xl text-center mb-5">Your Calendar</h1>
        
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center max-w-md mx-auto my-10 p-8 border border-zinc-300 rounded-lg bg-white shadow-md">
            <p className="font-serif text-sm text-center font-thin my-5">
              Connect your Google Calendar to view and manage your events in one place.
            </p>
            <button 
              onClick={handleAuthenticate}
              className="font-serif bg-green-800 ml-3 p-2 text-white text-xs rounded-4xl"
            >
              Connect Google Calendar
            </button>
          </div>
        ) : (
          <GoogleCalendar
            events={events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onFetchEvents={fetchCalendarEvents}
            isLoading={isLoading}
          />
        )}
      </div>
      
      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 bg-orange-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="font-serif text-xl mb-4">
              {modalMode === 'create' ? 'Add New Event' : 'Edit Event'}
            </h2>
            
            <div className="mb-4">
              <label className="font-serif text-xs block mb-1">Title</label>
              <input
                className="bg-white border border-zinc-300 text-xs p-2 rounded w-full"
                type="text"
                value={eventModalData.summary}
                onChange={(e) => setEventModalData({...eventModalData, summary: e.target.value})}
                placeholder="Event title"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="font-serif text-xs block mb-1">Location</label>
              <input
                className="bg-white border border-zinc-300 text-xs p-2 rounded w-full"
                type="text"
                value={eventModalData.location}
                onChange={(e) => setEventModalData({...eventModalData, location: e.target.value})}
                placeholder="Event location"
              />
            </div>
            
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="font-serif text-xs block mb-1">Start</label>
                <input
                  className="bg-white border border-zinc-300 text-xs p-2 rounded w-full"
                  type="datetime-local"
                  value={eventModalData.startDateTime}
                  onChange={(e) => setEventModalData({...eventModalData, startDateTime: e.target.value})}
                />
              </div>
              
              <div className="flex-1">
                <label className="font-serif text-xs block mb-1">End</label>
                <input
                  className="bg-white border border-zinc-300 text-xs p-2 rounded w-full"
                  type="datetime-local"
                  value={eventModalData.endDateTime}
                  onChange={(e) => setEventModalData({...eventModalData, endDateTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="font-serif text-xs block mb-1">Description</label>
              <textarea
                className="bg-white border border-zinc-300 text-xs p-2 rounded w-full"
                value={eventModalData.description}
                onChange={(e) => setEventModalData({...eventModalData, description: e.target.value})}
                placeholder="Event description"
                rows={3}
              />
            </div>
            
            <div className="mb-6">
              <label className="font-serif text-xs block mb-1">Color</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(COLOR_MAP).map(([id, color]) => (
                  <div
                    key={id}
                    className={`w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform ${eventModalData.colorId === id ? 'ring-2 ring-offset-2 ring-black scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setEventModalData({...eventModalData, colorId: id})}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowEventModal(false)}
                className="font-serif bg-white border border-zinc-300 text-xs p-2 rounded-xl"
                disabled={isLoading}
              >
                Cancel
              </button>
              
              {modalMode === 'edit' && (
                <button 
                  onClick={handleDeleteEvent}
                  className="font-serif bg-red-600 text-white text-xs p-2 rounded-xl"
                  disabled={isLoading}
                >
                  Delete
                </button>
              )}
              
              <button 
                onClick={handleSaveEvent}
                className="font-serif bg-green-800 text-white text-xs p-2 rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;