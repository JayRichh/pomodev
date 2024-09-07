import React, { useState, useCallback, useEffect } from 'react';
import { usePomodoroStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import TimerControls from './TimerControls';
import '@src/Popup.css';

const TimerTab: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBreakDuration, setNewBreakDuration] = useState<number>(5);
  const [newWorkDuration, setNewWorkDuration] = useState<number>(25);

  const {
    breakIntervals,
    timerQueue,
    timerState,
    settings,
    toggleTimer,
    stopTimer,
    resetTimer,
    setTime,
    addToTimerQueue,
    setSettings,
    removeFromTimerQueue,
  } = usePomodoroStorage();

  const theme = exampleThemeStorage.getSnapshot();
  const isLight = theme === 'light';

  useEffect(() => {
    if (settings) {
      setNewWorkDuration(settings.pomodoroDuration);
      setNewBreakDuration(settings.shortBreakDuration);
    }
  }, [settings]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerState.isRunning) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - timerState.lastUpdated) / 1000);
        const newTime = Math.max(0, timerState.time - elapsed);
        if (newTime !== timerState.time) {
          setTime(newTime);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.time, timerState.lastUpdated, setTime]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleTimeEdit = (e: React.FocusEvent<HTMLInputElement>) => {
    const [minutes, seconds] = e.target.value.split(':').map(Number);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      const newTime = minutes * 60 + seconds;
      setTime(newTime);
    }
    setIsEditing(false);
  };

  const handleToggleTimer = async () => {
    await toggleTimer();
  };

  const handleStopTimer = async () => {
    await stopTimer();
  };

  const handleResetTimer = async () => {
    await resetTimer();
  };

  const handleAddBreak = async () => {
    await addToTimerQueue({
      time: newBreakDuration * 60,
      isRunning: false,
      lastUpdated: Date.now(),
      type: 'break',
    });
  };

  const handleAddWork = async () => {
    await addToTimerQueue({
      time: newWorkDuration * 60,
      isRunning: false,
      lastUpdated: Date.now(),
      type: 'work',
    });
  };

  const handleWorkDurationChange = (value: number) => {
    setNewWorkDuration(value);
    setSettings({ pomodoroDuration: value });
  };

  const handleBreakDurationChange = (value: number) => {
    setNewBreakDuration(value);
    setSettings({ shortBreakDuration: value });
  };

  if (!timerState || !timerQueue || !settings) {
    return null;
  }

  const currentTimer = timerQueue[0] || timerState;
  const totalTime = currentTimer.type === 'work' ? settings.pomodoroDuration * 60 : settings.shortBreakDuration * 60;
  const progress = ((totalTime - currentTimer.time) / totalTime) * 100;

  const totalQueueTime = timerQueue.reduce((acc: number, timer: { time: number }) => acc + timer.time, 0);
  const totalSessionTime = timerState.time + totalQueueTime;
  const totalWorkTime = [timerState, ...timerQueue].reduce(
    (acc, timer) => (timer.type === 'work' ? acc + timer.time : acc),
    0,
  );

  return (
    <div className="flex flex-col min-h-full">
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
            onClick={() => setIsEditing(true)}>
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
          style={{ width: `${progress}%` }}></div>
      </div>

      <p className="text-sm mb-4 dark:text-gray-300">Total work time: {formatTime(totalWorkTime)}</p>

      <TimerControls
        isRunning={timerState.isRunning}
        isLight={isLight}
        onToggleTimer={handleToggleTimer}
        onStopTimer={handleStopTimer}
        onResetTimer={handleResetTimer}
        workDuration={newWorkDuration}
        breakDuration={newBreakDuration}
        onWorkDurationChange={handleWorkDurationChange}
        onBreakDurationChange={handleBreakDurationChange}
        onAddWork={handleAddWork}
        onAddBreak={handleAddBreak}
      />

      <div className="flex-grow flex flex-col max-h-[200px] overflow-y-auto">
        <div className="flex-grow overflow-hidden flex flex-col">
          <h3 className="text-lg font-semibold mb-2 dark:text-gray-300">Timer Queue</h3>
          <div className="flex-grow overflow-y-auto">
            <ul className="space-y-2 pr-2">
              {[timerState, ...timerQueue].map((timer, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-md text-sm text-gray-800 dark:text-gray-300">
                  <span>
                    {timer.type === 'work' ? 'Work' : 'Break'}: {formatTime(timer.time)}
                  </span>
                  {index > 0 && (
                    <button
                      onClick={() => removeFromTimerQueue(index - 1)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
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
                float: 'left',
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
