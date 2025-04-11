// StartPage.tsx
import React, { useState, useEffect, FormEvent } from 'react';
import SuggestionCard from '../components/SuggestionCard';
import useNavigation from '../hooks/useNavigation';

// Define the Suggestion interface
interface Suggestion {
  id: string;
  text: string;
}

function StartPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: '1', text: 'Breaks of at least 15 minutes should be scheduled between meetings longer than 1 hour.' },
    { id: '2', text: 'Work hours are from 9:00 AM to 6:00 PM.' },
    { id: '3', text: 'Lunch breaks should be scheduled between 12:00 PM and 1:30 PM.' },
    { id: '4', text: 'Recurring meetings should follow a consistent pattern (e.g., every Monday at 3:00 PM).' }
  ]);
  const [newSuggestion, setNewSuggestion] = useState<string>('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const { goToCalendar } = useNavigation();
  const gcal = "58bb38e21d70104473d2dc3ac96dac69f0f9c90dec5781b0c70abad43deffeb8@group.calendar.google.com" // TODO: DELETE LATER

  const handleAddSuggestion = (e: FormEvent) => {
    e.preventDefault();
    
    if (!newSuggestion.trim()) return;
    
    const newId = (suggestions.length + 1).toString();
    setSuggestions([...suggestions, { id: newId, text: newSuggestion }]);
    setNewSuggestion('');
  };

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(suggestion => suggestion.id !== id));
  };

  const handleEditSuggestion = (id: string, newText: string) => {
    setSuggestions(
      suggestions.map(suggestion => 
        suggestion.id === id ? { ...suggestion, text: newText } : suggestion
      )
    );
    setEditingCardId(null);
  };

  return (
    <div className="flex flex-col justify-between items-center min-h-screen bg-orange-50 px-10 py-8">
      <div className="w-full max-w-4xl">
        <div className="flex flex-row justify-end">
            <h1 className="font-serif text-4xl text-center mb-8 px-40">Calendar Suggestions</h1> 
            <button className='px-11 hover:px-10 font-serif hover:font-bold' onClick={() => goToCalendar(gcal)}> Continue</button>
        </div>
        <div className="flex flex-col gap-4">
          {suggestions.map(suggestion => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onDelete={handleDeleteSuggestion}
              onEdit={handleEditSuggestion}
              isEditing={editingCardId === suggestion.id}
              setIsEditing={(isEditing: boolean) => 
                setEditingCardId(isEditing ? suggestion.id : null)
              }
            />
          ))}
        </div>
        
        <div className="mt-8">
          <h2 className="font-serif text-2xl mb-4">Add New Suggestion</h2>
          <form onSubmit={handleAddSuggestion} className="flex flex-col">
            <textarea
              className="bg-white border border-zinc-300 text-sm p-3 rounded resize-none min-h-[100px]"
              value={newSuggestion}
              onChange={(e) => setNewSuggestion(e.target.value)}
              placeholder="Type your calendar suggestion here..."
            />
            <button 
              type="submit"
              className="font-serif bg-green-800 text-white text-xs p-2 rounded-xl mt-2 self-end"
              disabled={!newSuggestion.trim()}
            >
              Add Suggestion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default StartPage;