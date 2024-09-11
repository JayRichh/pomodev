import React from 'react';
import { useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

interface TimerControlsProps {
  isRunning: boolean;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onResetTimer: () => void;
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (value: number) => void;
  onBreakDurationChange: (value: number) => void;
  onAddWork: () => void;
  onAddBreak: () => void;
  onSkipToBreak: () => void;
  onSkipToWork: () => void;
  isWorkActive: boolean;
  hasNextWork: boolean;
  hasNextBreak: boolean;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  onToggleTimer,
  onStopTimer,
  onResetTimer,
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
  onAddWork,
  onAddBreak,
  onSkipToBreak,
  onSkipToWork,
  isWorkActive,
  hasNextWork,
  hasNextBreak,
}) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  const buttonBaseClass =
    'flex-1 py-2 px-4 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const inputBaseClass = 'w-16 p-2 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-offset-2';

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between space-x-2">
        <button
          className={`${buttonBaseClass} ${
            isRunning
              ? isLight
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500'
              : isLight
                ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
                : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
          }`}
          onClick={onToggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          className={`${buttonBaseClass} ${
            isLight
              ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
              : 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
          }`}
          onClick={onStopTimer}>
          Stop
        </button>
        <button
          className={`${buttonBaseClass} ${
            isLight
              ? 'bg-gray-300 hover:bg-gray-400 text-gray-800 focus:ring-gray-400'
              : 'bg-gray-600 hover:bg-gray-700 text-gray-200 focus:ring-gray-500'
          }`}
          onClick={onResetTimer}>
          Reset
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={workDuration}
            onChange={e => onWorkDurationChange(Number(e.target.value))}
            className={`${inputBaseClass} ${
              isLight
                ? 'border-gray-300 text-gray-800 focus:ring-blue-500'
                : 'border-gray-600 bg-gray-700 text-gray-200 focus:ring-blue-500'
            }`}
            min="1"
          />
          <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>min work</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={breakDuration}
            onChange={e => onBreakDurationChange(Number(e.target.value))}
            className={`${inputBaseClass} ${
              isLight
                ? 'border-gray-300 text-gray-800 focus:ring-green-500'
                : 'border-gray-600 bg-gray-700 text-gray-200 focus:ring-green-500'
            }`}
            min="1"
          />
          <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>min break</span>
        </div>
      </div>

      <div className="flex justify-between space-x-2">
        <button
          onClick={onAddWork}
          className={`${buttonBaseClass} ${
            isLight
              ? 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
              : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
          }`}>
          Add Work
        </button>
        <button
          onClick={onAddBreak}
          className={`${buttonBaseClass} ${
            isLight
              ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500'
              : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
          }`}>
          Add Break
        </button>
      </div>

      <div className="flex justify-between space-x-2">
        <button
          onClick={onSkipToBreak}
          disabled={!isWorkActive || !hasNextBreak}
          className={`${buttonBaseClass} ${
            isWorkActive && hasNextBreak
              ? isLight
                ? 'bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-indigo-500'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          Take Break
        </button>
        <button
          onClick={onSkipToWork}
          disabled={isWorkActive || !hasNextWork}
          className={`${buttonBaseClass} ${
            !isWorkActive && hasNextWork
              ? isLight
                ? 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-500'
                : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          Start Work
        </button>
      </div>
    </div>
  );
};

export default TimerControls;
