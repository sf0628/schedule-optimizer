// SuggestionCard.tsx
import React, { useState } from 'react';

interface Suggestion {
  id: string;
  text: string;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  onDelete: (id: string) => void;
  onEdit: (id: string, newText: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onDelete,
  onEdit,
  isEditing,
  setIsEditing
}) => {
  const [editText, setEditText] = useState(suggestion.text);

  const handleSave = () => {
    if (editText.trim()) {
      onEdit(suggestion.id, editText);
    }
  };

  const handleCancel = () => {
    setEditText(suggestion.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-zinc-200 hover:shadow-lg transition-shadow">
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-zinc-300 rounded p-2 text-sm resize-none min-h-[100px]"
            autoFocus
            placeholder="Edit your suggestion..."
          />
        ) : (
          <p className="font-serif text-sm mb-3">{suggestion.text}</p>
        )}
      </div>
      
      <div className="flex justify-end px-4 py-2 bg-gray-50 border-t border-zinc-200">
        {isEditing ? (
          <>
            <button 
              onClick={handleCancel}
              className="font-serif bg-white border border-zinc-300 text-xs p-2 rounded-xl mr-2"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="font-serif bg-green-800 text-white text-xs p-2 rounded-xl"
              disabled={!editText.trim()}
            >
              Save
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsEditing(true)}
              className="font-serif bg-white border border-zinc-300 text-xs p-2 rounded-xl mr-2"
            >
              Edit
            </button>
            <button 
              onClick={() => onDelete(suggestion.id)}
              className="font-serif bg-red-600 text-white text-xs p-2 rounded-xl"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard;