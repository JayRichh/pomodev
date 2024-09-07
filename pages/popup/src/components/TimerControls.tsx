import React from 'react';
import { NumberSetting } from './SettingsTab';

interface TimerControlsProps {
  isRunning: boolean;
  isLight: boolean;
  onToggleTimer: () => void;
  onStopTimer: () => void;
  onResetTimer: () => void;
  workDuration: number;
  breakDuration: number;
  onWorkDurationChange: (value: number) => void;
  onBreakDurationChange: (value: number) => void;
  onAddWork: () => void;
  onAddBreak: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  isLight,
  onToggleTimer,
  onStopTimer,
  onResetTimer,
  workDuration,
  breakDuration,
  onWorkDurationChange,
  onBreakDurationChange,
  onAddWork,
  onAddBreak,
}) => {
  return (
    <>
      <div className="flex justify-center space-x-2 mb-4">
        <button
          className={`flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
            ${
              isRunning
                ? isLight
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-700 text-white hover:bg-red-800'
                : isLight
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-green-700 text-white hover:bg-green-800'
            }`}
          onClick={onToggleTimer}>
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
            ${isLight ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-yellow-700 text-white hover:bg-yellow-800'}`}
          onClick={onStopTimer}>
          Stop
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
            ${isLight ? 'bg-gray-300 text-black hover:bg-gray-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          onClick={onResetTimer}>
          Reset
        </button>
      </div>

      <div className="flex justify-between items-center mb-2 text-sm dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <NumberSetting value={workDuration} onChange={onWorkDurationChange} isLight={isLight} />
          <span>min work</span>
        </div>
        <div className="flex items-center space-x-2">
          <NumberSetting value={breakDuration} onChange={onBreakDurationChange} isLight={isLight} />
          <span>min break</span>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={onAddWork}
          className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors duration-300 text-sm font-medium">
          Add Work
        </button>
        <button
          onClick={onAddBreak}
          className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors duration-300 text-sm font-medium">
          Add Break
        </button>
      </div>
    </>
  );
};

export default TimerControls;
