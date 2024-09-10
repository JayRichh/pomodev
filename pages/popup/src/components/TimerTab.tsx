import React, { useState, useCallback, useEffect } from 'react';
import { usePomodoroStorage, useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import TimerControls from './TimerControls';

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
    skipToBreak,
    skipToWork,
  } = usePomodoroStorage();

  const theme = useStorageSuspense(exampleThemeStorage);
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

  const handleSkipToBreak = async () => {
    await skipToBreak();
  };

  const handleSkipToWork = async () => {
    await skipToWork();
  };

  const isWorkActive = timerState.type === 'work';
  const hasNextWork = timerQueue.some(timer => timer.type === 'work');
  const hasNextBreak = timerQueue.some(timer => timer.type === 'break');

  if (!timerState || !timerQueue || !settings) {
    return null;
  }

  const totalWorkTime = [timerState, ...timerQueue].reduce(
    (acc, timer) => (timer.type === 'work' ? acc + timer.time : acc),
    0,
  );

  const totalSessionTime = [timerState, ...timerQueue].reduce((acc, timer) => acc + timer.time, 0);
  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      <div className="p-4 text-center">
        {isEditing ? (
          <input
            type="text"
            defaultValue={formatTime(timerState.time)}
            onBlur={handleTimeEdit}
            className="text-6xl font-bold w-full text-center bg-transparent text-foreground"
            autoFocus
          />
        ) : (
          <h2 className="text-6xl font-bold cursor-pointer" onClick={() => setIsEditing(true)}>
            {formatTime(timerState.time)}
          </h2>
        )}
        <p className="text-xl mt-2 text-muted-foreground">{timerState.type}</p>
        <p className="text-sm mt-1 text-muted-foreground">Total work time: {formatTime(totalWorkTime)}</p>
      </div>

      <TimerControls
        isRunning={timerState.isRunning}
        onToggleTimer={handleToggleTimer}
        onStopTimer={handleStopTimer}
        onResetTimer={handleResetTimer}
        workDuration={newWorkDuration}
        breakDuration={newBreakDuration}
        onWorkDurationChange={handleWorkDurationChange}
        onBreakDurationChange={handleBreakDurationChange}
        onAddWork={handleAddWork}
        onAddBreak={handleAddBreak}
        onSkipToBreak={handleSkipToBreak}
        onSkipToWork={handleSkipToWork}
        isWorkActive={isWorkActive}
        hasNextWork={hasNextWork}
        hasNextBreak={hasNextBreak}
      />

      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Timer Queue</h3>
        <ul className="space-y-2">
          {[timerState, ...timerQueue].map((timer, index) => (
            <li key={index} className="flex justify-between items-center">
              <span className={timer.type === 'work' ? 'text-primary' : 'text-accent'}>
                {timer.type === 'work' ? 'Work' : 'Break'}: {formatTime(timer.time)}
              </span>
              {index > 0 && (
                <button
                  onClick={() => removeFromTimerQueue(index - 1)}
                  className="text-destructive hover:text-destructive">
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="h-2 w-full mt-2 rounded-full overflow-hidden bg-muted">
          {[timerState, ...timerQueue].map((timer, index) => (
            <div
              key={index}
              className={`h-full ${timer.type === 'work' ? 'bg-primary' : 'bg-accent'}`}
              style={{ width: `${(timer.time / totalSessionTime) * 100}%`, float: 'left' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimerTab;
