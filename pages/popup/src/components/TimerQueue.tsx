import React from 'react';
import { TimerState } from '@extension/storage/lib/pomodoroStorage';

interface TimerQueueProps {
  currentTimer: TimerState;
  queue: TimerState[];
  onRemove: (index: number) => void;
  formatTime: (seconds: number) => string;
}

const TimerQueue: React.FC<TimerQueueProps> = ({ currentTimer, queue, onRemove, formatTime }) => {
  const totalTime = [currentTimer, ...queue].reduce((acc, timer) => acc + timer.time, 0);

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Timer Queue</h3>
      <ul className="space-y-2">
        {[currentTimer, ...queue].map((timer, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className={timer.type === 'work' ? 'text-blue-600' : 'text-green-600'}>
              {timer.type === 'work' ? 'Work' : 'Break'}: {formatTime(timer.time)}
            </span>
            {index > 0 && (
              <button onClick={() => onRemove(index - 1)} className="text-red-500 hover:text-red-700">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="h-2 w-full bg-gray-200 mt-2 rounded-full overflow-hidden">
        {[currentTimer, ...queue].map((timer, index) => (
          <div
            key={index}
            className={`h-full ${timer.type === 'work' ? 'bg-blue-500' : 'bg-green-500'}`}
            style={{ width: `${(timer.time / totalTime) * 100}%`, float: 'left' }}
          />
        ))}
      </div>
    </div>
  );
};

export default TimerQueue;
