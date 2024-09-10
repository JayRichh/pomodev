import React, { useState } from 'react';
import { useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

interface TimerDisplayProps {
  time: number;
  type: 'work' | 'break';
  totalWorkTime: number;
  onTimeEdit: (newTime: number) => void;
  formatTime: (seconds: number) => string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, type, totalWorkTime, onTimeEdit, formatTime }) => {
  const [isEditing, setIsEditing] = useState(false);
  const theme = useStorageSuspense(exampleThemeStorage);

  const handleTimeEdit = (e: React.FocusEvent<HTMLInputElement>) => {
    const [minutes, seconds] = e.target.value.split(':').map(Number);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      onTimeEdit(minutes * 60 + seconds);
    }
    setIsEditing(false);
  };

  return (
    <div className={`p-4 text-center ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}>
      {isEditing ? (
        <input
          type="text"
          defaultValue={formatTime(time)}
          onBlur={handleTimeEdit}
          className={`text-6xl font-bold w-full text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}
          autoFocus
        />
      ) : (
        <h2
          className={`text-6xl font-bold cursor-pointer ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}
          onClick={() => setIsEditing(true)}>
          {formatTime(time)}
        </h2>
      )}
      <p className={`text-xl mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>{type}</p>
      <p className={`text-sm mt-1 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
        Total work time: {formatTime(totalWorkTime)}
      </p>
    </div>
  );
};

export default TimerDisplay;
