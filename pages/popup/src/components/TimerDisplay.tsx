import React, { useState } from 'react';
import { useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

interface TimerDisplayProps {
  time: number;
  type: 'work' | 'break';
  elapsedWorkTime: number;
  elapsedBreakTime: number;
  onTimeEdit: (newTime: number) => void;
  formatTime: (seconds: number) => string;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  type,
  elapsedWorkTime,
  elapsedBreakTime,
  onTimeEdit,
  formatTime,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  const handleTimeEdit = (e: React.FocusEvent<HTMLInputElement>) => {
    const [minutes, seconds] = e.target.value.split(':').map(Number);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      onTimeEdit(minutes * 60 + seconds);
    }
    setIsEditing(false);
  };

  return (
    <div className="text-center py-4">
      {isEditing ? (
        <input
          type="text"
          defaultValue={formatTime(time)}
          onBlur={handleTimeEdit}
          className={`text-5xl font-bold w-full text-center bg-transparent focus:outline-none ${
            isLight ? 'text-foreground' : 'dark:text-foreground'
          }`}
          autoFocus
        />
      ) : (
        <h2
          className={`text-5xl font-bold cursor-pointer ${isLight ? 'text-foreground' : 'dark:text-foreground'}`}
          onClick={() => setIsEditing(true)}>
          {formatTime(time)}
        </h2>
      )}
      <p className={`text-lg mt-1 ${isLight ? 'text-muted-foreground' : 'dark:text-muted-foreground'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </p>
      <div className="flex justify-between mt-2 text-sm">
        <div>
          <p className={isLight ? 'text-muted-foreground' : 'dark:text-muted-foreground'}>Total work time</p>
          <p className={`font-semibold ${isLight ? 'text-foreground' : 'dark:text-foreground'}`}>
            {formatTime(elapsedWorkTime)}
          </p>
        </div>
        <div>
          <p className={isLight ? 'text-muted-foreground' : 'dark:text-muted-foreground'}>Total break time</p>
          <p className={`font-semibold ${isLight ? 'text-foreground' : 'dark:text-foreground'}`}>
            {formatTime(elapsedBreakTime)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;
