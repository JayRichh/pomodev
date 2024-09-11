import React from 'react';
import { TimerState } from '@extension/storage/lib/pomodoroStorage';
import { useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';

interface TimerQueueProps {
  currentTimer: TimerState;
  queue: TimerState[];
  onRemove: (index: number) => void;
  formatTime: (seconds: number) => string;
}

const TimerQueue: React.FC<TimerQueueProps> = ({ currentTimer, queue, onRemove, formatTime }) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';
  const allTimers = [currentTimer, ...queue];
  const totalTime = allTimers.reduce((acc, timer) => acc + timer.time, 0);

  return (
    <div className="mt-4">
      <h3 className={`text-lg font-semibold mb-2 ${isLight ? 'text-gray-800' : 'text-gray-100'}`}>Timer Queue</h3>
      <ul className="space-y-2 mb-4">
        {allTimers.map((timer, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className={`${isLight ? 'text-gray-800' : 'text-gray-100'}`}>
              {timer.type === 'work' ? 'Work' : 'Break'}: {formatTime(timer.time)}
            </span>
            {index > 0 && (
              <button
                onClick={() => onRemove(index - 1)}
                className={`${isLight ? 'text-gray-600 hover:text-gray-800' : 'text-gray-300 hover:text-white'} transition-colors duration-200`}>
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className={`h-2 w-full ${isLight ? 'bg-gray-200' : 'bg-gray-600'} rounded-full overflow-hidden`}>
        <div className="h-full w-full flex">
          {allTimers.map((timer, index) => (
            <div
              key={index}
              className={`${
                timer.type === 'work'
                  ? isLight
                    ? 'bg-blue-400'
                    : 'bg-blue-500'
                  : timer.type === 'break'
                    ? isLight
                      ? 'bg-green-400'
                      : 'bg-green-500'
                    : isLight
                      ? 'bg-red-400'
                      : 'bg-red-500'
              }`}
              style={{
                width: `${(timer.time / totalTime) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerQueue;
