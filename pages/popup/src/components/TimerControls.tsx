import { useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import React from 'react';

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

  return (
    <div className="flex flex-col">
      <div className="flex justify-between">
        <button
          className={`flex-1 py-2 font-medium ${isRunning ? 'bg-red-500' : 'bg-green-500'} text-white`}
          onClick={onToggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          className={`flex-1 py-2 ${isLight ? 'bg-yellow-500 text-white' : 'bg-yellow-400 text-white'}`}
          onClick={onStopTimer}>
          Stop
        </button>
        <button
          className={`flex-1 py-2 ${isLight ? 'bg-gray-300 text-gray-800' : 'bg-gray-600 text-gray-200'}`}
          onClick={onResetTimer}>
          Reset
        </button>
      </div>

      <div className="flex justify-between mt-2">
        <div className="flex items-center">
          <input
            type="number"
            value={workDuration}
            onChange={e => onWorkDurationChange(Number(e.target.value))}
            className={`w-12 p-1 text-center border ${isLight ? 'border-gray-300 text-gray-800' : 'border-gray-600 text-gray-200'}`}
            min="1"
          />
          <span className={`ml-1 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>min work</span>
        </div>
        <div className="flex items-center">
          <input
            type="number"
            value={breakDuration}
            onChange={e => onBreakDurationChange(Number(e.target.value))}
            className={`w-12 p-1 text-center border ${isLight ? 'border-gray-300 text-gray-800' : 'border-gray-600 text-gray-200'}`}
            min="1"
          />
          <span className={`ml-1 text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'}`}>min break</span>
        </div>
      </div>

      <div className="flex justify-between mt-2">
        <button
          onClick={onAddWork}
          className={`flex-1 py-2 ${isLight ? 'bg-blue-500' : 'bg-blue-400'} text-white font-medium`}>
          Add Work
        </button>
        <button
          onClick={onAddBreak}
          className={`flex-1 py-2 ${isLight ? 'bg-green-500' : 'bg-green-400'} text-white font-medium ml-2`}>
          Add Break
        </button>
      </div>

      <div className="flex justify-between mt-2">
        <button
          onClick={onSkipToBreak}
          disabled={!isWorkActive || !hasNextBreak}
          className={`flex-1 py-2 font-medium ${
            isWorkActive && hasNextBreak
              ? `${isLight ? 'bg-gray-300 text-gray-800' : 'bg-gray-600 text-gray-200'}`
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          Take Break
        </button>
        <button
          onClick={onSkipToWork}
          disabled={isWorkActive || !hasNextWork}
          className={`flex-1 py-2 font-medium ml-2 ${
            !isWorkActive && hasNextWork
              ? `${isLight ? 'bg-purple-500 text-white' : 'bg-purple-400 text-white'}`
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}>
          Start Work
        </button>
      </div>
    </div>
  );
};

export default TimerControls;
