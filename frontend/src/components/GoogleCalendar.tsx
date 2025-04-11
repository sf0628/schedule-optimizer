import React, { useState, useEffect } from 'react';
//import './GoogleCalendar.css';

// Google Calendar Event interface
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

// Internal Event format
type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  start: string; // format: "HH:MM"
  end: string; // format: "HH:MM"
  color?: string;
  location?: string;
  creator?: string;
};

type ViewType = 'month' | 'week' | 'day';

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

interface GoogleCalendarProps {
  events?: GoogleCalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onFetchEvents?: (startDate: Date, endDate: Date) => void;
  isLoading?: boolean;
}

const GoogleCalendar: React.FC<GoogleCalendarProps> = ({
  events = [],
  onEventClick = () => {},
  onDateClick = () => {},
  onFetchEvents = () => {},
  isLoading = false,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<ViewType>('month');
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Convert Google Calendar events to internal format
  useEffect(() => {
    const convertedEvents = events.map(event => {
      const startDate = new Date(event.start.dateTime);
      const endDate = new Date(event.end.dateTime);
      
      return {
        id: event.id,
        title: event.summary,
        description: event.description,
        date: startDate,
        start: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
        end: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
        color: event.colorId ? COLOR_MAP[event.colorId] : COLOR_MAP['default'],
        location: event.location,
        creator: event.creator?.displayName || event.creator?.email,
      };
    });
    
    setCalendarEvents(convertedEvents);
  }, [events]);

  // Fetch events when date range changes
  useEffect(() => {
    let startDate: Date;
    let endDate: Date;
    
    if (view === 'month') {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    } else if (view === 'week') {
      const day = currentDate.getDay();
      startDate = new Date(currentDate);
      startDate.setDate(currentDate.getDate() - day);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    } else {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
    }
    
    onFetchEvents(startDate, endDate);
  }, [currentDate, view, onFetchEvents]);

  // Helper functions
  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekDays = (date: Date): Date[] => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const weekStart = new Date(date);
    weekStart.setDate(diff);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(weekStart);
      newDate.setDate(weekStart.getDate() + i);
      days.push(newDate);
    }
    
    return days;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  const changeWeek = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (delta * 7));
    setCurrentDate(newDate);
  };

  const changeDay = (delta: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + delta);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateClick(date);
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => isSameDay(event.date, date));
  };

  // Render functions
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    
    // Create array for all days in the month
    const days: (Date | null)[] = Array(firstDayOfMonth).fill(null);
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push(date);
    }
    
    const rows = Math.ceil(days.length / 7);
    while (days.length < rows * 7) {
      days.push(null);
    }
    
    return (
      <div className="flex flex-col">
        <div className="flex bg-gray-50 border-b border-zinc-300">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={index} className="flex-1 text-center p-3 font-serif font-bold text-gray-600">{day}</div>
          ))}
        </div>
        <div className="flex flex-wrap">
          {days.map((date, index) => (
            <div
              key={index}
              className={`w-1/7 h-[120px] border-r border-b border-zinc-300 p-2 overflow-hidden cursor-pointer ${
                date && isToday(date) ? 'bg-blue-50' : ''
              } ${date && isSameDay(date, selectedDate) ? 'border-2 border-green-800' : ''} 
              ${!date ? 'bg-gray-50 text-gray-300 cursor-default' : 'hover:bg-gray-50'}`}
              onClick={() => date && handleDateClick(date)}
            >
              {date && (
                <>
                  <div className="font-bold mb-2">{date.getDate()}</div>
                  <div className="flex flex-col gap-1">
                    {getEventsForDate(date).slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="p-1 px-2 rounded text-white text-xs whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: event.color || '#4285f4' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDate(date).length > 3 && (
                      <div className="text-xs text-gray-500 text-center mt-1">
                        +{getEventsForDate(date).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="flex flex-col h-[600px] overflow-y-auto">
        <div className="flex bg-gray-50 border-b border-zinc-300">
          <div className="w-[60px] flex-shrink-0"></div>
          {weekDays.map((date, index) => (
            <div
              key={index}
              className={`flex-1 text-center p-3 cursor-pointer ${
                isToday(date) ? 'bg-blue-50' : ''
              } ${isSameDay(date, selectedDate) ? 'border-2 border-green-800' : ''}`}
              onClick={() => handleDateClick(date)}
            >
              <div className="font-serif text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
              <div className="font-serif font-bold">{date.getDate()}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-zinc-300 min-h-[60px]">
              <div className="w-[60px] p-2 text-right text-gray-500 text-xs flex-shrink-0 border-r border-zinc-300">{`${hour}:00`}</div>
              {weekDays.map((date, dayIndex) => {
                const hourEvents = getEventsForDate(date).filter((event) => {
                  const startHour = parseInt(event.start.split(':')[0], 10);
                  return startHour === hour;
                });
                
                return (
                  <div
                    key={dayIndex}
                    className="flex-1 border-r border-zinc-300 p-1 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      const newDate = new Date(date);
                      newDate.setHours(hour);
                      handleDateClick(newDate);
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-1 px-2 rounded text-white text-xs mb-1 cursor-pointer hover:opacity-90"
                        style={{ backgroundColor: event.color || '#4285f4' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                      >
                        {`${formatTime(event.start)} - ${formatTime(event.end)}: ${event.title}`}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="flex flex-col h-[600px] overflow-y-auto">
        <div className="flex bg-gray-50 border-b border-zinc-300">
          <div className="w-[60px] flex-shrink-0"></div>
          <div
            className={`flex-1 text-center p-3 cursor-pointer ${
              isToday(currentDate) ? 'bg-blue-50' : ''
            } ${isSameDay(currentDate, selectedDate) ? 'border-2 border-green-800' : ''}`}
            onClick={() => handleDateClick(currentDate)}
          >
            <span className="font-serif font-bold">{formatDate(currentDate)}</span>
          </div>
        </div>
        <div className="flex flex-col">
          {hours.map((hour) => {
            const hourEvents = getEventsForDate(currentDate).filter((event) => {
              const startHour = parseInt(event.start.split(':')[0], 10);
              return startHour === hour;
            });
            
            return (
              <div key={hour} className="flex border-b border-zinc-300 min-h-[60px]">
                <div className="w-[60px] p-2 text-right text-gray-500 text-xs flex-shrink-0 border-r border-zinc-300">{`${hour}:00`}</div>
                <div
                  className="flex-1 p-1 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    newDate.setHours(hour);
                    handleDateClick(newDate);
                  }}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-1 px-2 rounded text-white text-xs mb-1 cursor-pointer hover:opacity-90"
                      style={{ backgroundColor: event.color || '#4285f4' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      {`${formatTime(event.start)} - ${formatTime(event.end)}: ${event.title}`}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="border border-zinc-300 rounded-lg overflow-hidden bg-white shadow-md max-w-screen-lg mx-auto">
      <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-zinc-300">
        <div className="flex gap-2">
          <button 
            onClick={() => setView('month')} 
            className={`font-serif text-xs p-2 rounded-xl ${view === 'month' ? 'bg-green-800 text-white' : 'bg-white border border-zinc-300'}`}
          >
            Month
          </button>
          <button 
            onClick={() => setView('week')} 
            className={`font-serif text-xs p-2 rounded-xl ${view === 'week' ? 'bg-green-800 text-white' : 'bg-white border border-zinc-300'}`}
          >
            Week
          </button>
          <button 
            onClick={() => setView('day')} 
            className={`font-serif text-xs p-2 rounded-xl ${view === 'day' ? 'bg-green-800 text-white' : 'bg-white border border-zinc-300'}`}
          >
            Day
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          {view === 'month' && (
            <>
              <button 
                onClick={() => changeMonth(-1)} 
                className="font-serif text-xs p-2 bg-white border border-zinc-300 rounded-xl"
              >
                Previous
              </button>
              <span className="font-serif font-bold min-w-[180px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button 
                onClick={() => changeMonth(1)} 
                className="font-serif text-xs p-2 bg-white border border-zinc-300 rounded-xl"
              >
                Next
              </button>
            </>
          )}
          {view === 'week' && (
            <>
              <button 
                onClick={() => changeWeek(-1)} 
                className="font-serif text-xs p-2 bg-white border border-zinc-300 rounded-xl"
              >
                Previous
              </button>
              <span className="font-serif font-bold min-w-[180px] text-center">
                Week of {getWeekDays(currentDate)[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {
                  getWeekDays(currentDate)[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                }
              </span>
              <button 
                onClick={() => changeWeek(1)} 
                className="font-serif text-xs p-2 bg-white border border-zinc-300 rounded-xl"
              >
                Next
              </button>
            </>
          )}
          {view === 'day' && (
            <>
              <button 
                onClick={() => changeDay(-1)} 
                className="font-serif text-xs p-2 bg-white border border-zinc-300 rounded-xl"
              >
                Previous
              </button>
              <span className="font-serif font-bold min-w-[180px] text-center">
                {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <button 
                onClick={() => changeDay(1)} 
                className="font-serif text-xs p-2 bg-white border border-zinc-300 rounded-xl"
              >
                Next
              </button>
            </>
          )}
        </div>
        
        <button 
          onClick={() => {
            const today = new Date();
            setCurrentDate(today);
            setSelectedDate(today);
          }}
          className="font-serif bg-green-800 ml-3 p-2 text-white text-xs rounded-xl"
        >
          Today
        </button>
      </div>
      
      <div className="calendar-view">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="border-4 border-t-green-800 border-b-gray-200 border-l-gray-200 border-r-gray-200 rounded-full w-10 h-10 animate-spin mb-4"></div>
            <p className="font-serif text-sm text-center">Loading calendar events...</p>
          </div>
        ) : (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendar;