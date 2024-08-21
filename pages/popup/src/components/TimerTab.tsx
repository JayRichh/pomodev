import React, { useState, useCallback, useEffect } from 'react';
import { usePomodoroStorage } from '@extension/shared';
import { pomodoroStorage, exampleThemeStorage } from '@extension/storage';
import '@src/Popup.css';

const TimerTab: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBreakDuration, setNewBreakDuration] = useState<number>(5);
  const [newWorkDuration, setNewWorkDuration] = useState<number>(25);

  const pomodoroState = usePomodoroStorage();
  const { breakIntervals, timerQueue, timerState, settings } = pomodoroState || {};
  const theme = exampleThemeStorage.getSnapshot();
  const isLight = theme === 'light';

  useEffect(() => {
    if (settings) {
      setNewWorkDuration(settings.pomodoroDuration);
      setNewBreakDuration(settings.shortBreakDuration);
    }
  }, [settings]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleTimeEdit = (e: React.FocusEvent<HTMLInputElement>) => {
    const [minutes, seconds] = e.target.value.split(':').map(Number);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      const newTime = minutes * 60 + seconds;
      pomodoroStorage.setTime(newTime);
    }
    setIsEditing(false);
  };

  const handleToggleTimer = async () => {
    await pomodoroStorage.toggleTimer();
  };

  const handleStopTimer = async () => {
    await pomodoroStorage.stopTimer();
  };

  const handleResetTimer = async () => {
    await pomodoroStorage.resetTimer();
  };

  const handleAddBreak = async () => {
    await pomodoroStorage.addToTimerQueue({
      time: newBreakDuration * 60,
      isRunning: false,
      lastUpdated: Date.now(),
      type: 'break',
    });
  };

  const handleAddWork = async () => {
    await pomodoroStorage.addToTimerQueue({
      time: newWorkDuration * 60,
      isRunning: false,
      lastUpdated: Date.now(),
      type: 'work',
    });
  };

  const handleWorkDurationChange = (value: number) => {
    setNewWorkDuration(value);
    pomodoroStorage.setSettings({ pomodoroDuration: value });
  };

  const handleBreakDurationChange = (value: number) => {
    setNewBreakDuration(value);
    pomodoroStorage.setSettings({ shortBreakDuration: value });
  };

  if (!timerState || !timerQueue || !settings) {
    return null; // or some loading state
  }

  const currentTimer = timerQueue[0] || timerState;
  const totalTime = currentTimer.type === 'work' ? settings.pomodoroDuration * 60 : settings.shortBreakDuration * 60;
  const progress = ((totalTime - currentTimer.time) / totalTime) * 100;

  const totalQueueTime = timerQueue.reduce((acc: number, timer: { time: number }) => acc + timer.time, 0);
  const totalSessionTime = timerState.time + totalQueueTime;
  const totalWorkTime = [timerState, ...timerQueue].reduce((acc, timer) => 
    timer.type === 'work' ? acc + timer.time : acc, 0
  );

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-4">
        {isEditing ? (
          <input
            type="text"
            defaultValue={formatTime(timerState.time)}
            onBlur={handleTimeEdit}
            className={`text-6xl font-bold w-full max-w-xs text-center bg-transparent border-b-2 ${
              isLight ? 'border-gray-300 focus:border-blue-500' : 'border-gray-700 focus:border-blue-400'
            }`}
            autoFocus
          />
        ) : (
          <h2
            className="text-6xl font-bold cursor-pointer hover:text-blue-500 transition-colors duration-300"
            onClick={() => setIsEditing(true)}
          >
            {formatTime(timerState.time)}
          </h2>
        )}
        <p className="text-xl mt-2">{timerState.type}</p>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            !timerState.isRunning
              ? 'bg-gray-400 dark:bg-gray-600'
              : timerState.type === 'work'
              ? 'bg-green-500'
              : 'bg-orange-500'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <p className="text-sm mb-4 dark:text-gray-300">Total work time: {formatTime(totalWorkTime)}</p>

      <div className="flex justify-center space-x-2 mb-4">
        <button
          className={`
            flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
            ${timerState.isRunning
              ? isLight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-700 text-white hover:bg-red-800'
              : isLight ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-green-700 text-white hover:bg-green-800'}
          `}
          onClick={handleToggleTimer}
        >
          {timerState.isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          className={`
            flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
            ${isLight ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-yellow-700 text-white hover:bg-yellow-800'}
          `}
          onClick={handleStopTimer}
        >
          Stop
        </button>
        <button
          className={`
            flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
            ${isLight ? 'bg-gray-300 text-black hover:bg-gray-400' : 'bg-gray-700 text-white hover:bg-gray-600'}
          `}
          onClick={handleResetTimer}
        >
          Reset
        </button>
      </div>

      <div className="flex justify-between items-center mb-2 text-sm dark:text-gray-300">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={newWorkDuration}
            onChange={(e) => handleWorkDurationChange(Number(e.target.value))}
            className="w-12 p-1 rounded text-black dark:text-white dark:bg-gray-600 text-center"
            min="1"
          />
          <span>min work</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={newBreakDuration}
            onChange={(e) => handleBreakDurationChange(Number(e.target.value))}
            className="w-12 p-1 rounded text-black dark:text-white dark:bg-gray-600 text-center"
            min="1"
          />
          <span>min break</span>
        </div>
      </div>
      <div className="flex-grow flex flex-col max-h-[200px] overflow-y-auto">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={handleAddWork}
            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition-colors duration-300 text-sm font-medium"
          >
            Add Work
          </button>
          <button
            onClick={handleAddBreak}
            className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors duration-300 text-sm font-medium"
          >
            Add Break
          </button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Timer Queue</h3>
          <div className="flex-grow overflow-y-auto">
            <ul className="space-y-2 pr-2">
              {[timerState, ...timerQueue].map((timer, index) => (
                <li key={index} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md text-sm text-gray-800 dark:text-gray-300">
                  <span>{timer.type === 'work' ? 'Work' : 'Break'}: {formatTime(timer.time)}</span>
                  {index > 0 && (
                    <button
                      onClick={() => pomodoroStorage.removeFromTimerQueue(index - 1)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          {[timerState, ...timerQueue].map((timer, index) => (
            <div
              key={index}
              className={`h-full ${timer.type === 'work' ? 'bg-blue-500' : 'bg-green-500'} ${
                index === 0 ? 'opacity-100' : 'opacity-50'
              }`}
              style={{
                width: `${(timer.time / totalSessionTime) * 100}%`,
                float: 'left'
              }}
              title={`${timer.type}: ${formatTime(timer.time)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerTab;