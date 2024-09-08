import React, { useState } from 'react';

interface TimerDisplayProps {
  time: number;
  type: 'work' | 'break';
  totalWorkTime: number;
  onTimeEdit: (newTime: number) => void;
  formatTime: (seconds: number) => string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ time, type, totalWorkTime, onTimeEdit, formatTime }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleTimeEdit = (e: React.FocusEvent<HTMLInputElement>) => {
    const [minutes, seconds] = e.target.value.split(':').map(Number);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      onTimeEdit(minutes * 60 + seconds);
    }
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-100 p-4 text-center">
      {isEditing ? (
        <input
          type="text"
          defaultValue={formatTime(time)}
          onBlur={handleTimeEdit}
          className="text-6xl font-bold w-full text-center bg-transparent"
          autoFocus
        />
      ) : (
        <h2 className="text-6xl font-bold cursor-pointer" onClick={() => setIsEditing(true)}>
          {formatTime(time)}
        </h2>
      )}
      <p className="text-xl text-gray-600 mt-2">{type}</p>
      <p className="text-sm text-gray-600 mt-1">Total work time: {formatTime(totalWorkTime)}</p>
    </div>
  );
};

export default TimerDisplay;
