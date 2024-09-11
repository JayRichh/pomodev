import React, { useState, useCallback, useEffect, useRef } from 'react';
import { usePomodoroStorage, useStorageSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import TimerControls from './TimerControls';
import TimerQueue from './TimerQueue';
import TimerDisplay from './TimerDisplay';

interface ElapsedTimes {
  work: number;
  break: number;
}

const TimerTab: React.FC = () => {
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

  const [newBreakDuration, setNewBreakDuration] = useState<number>(settings?.shortBreakDuration || 5);
  const [newWorkDuration, setNewWorkDuration] = useState<number>(settings?.pomodoroDuration || 25);
  const [elapsedTimes, setElapsedTimes] = useState<ElapsedTimes>(() => {
    const storedTimes = localStorage.getItem('elapsedTimes');
    return storedTimes ? JSON.parse(storedTimes) : { work: 0, break: 0 };
  });

  const lastTickRef = useRef<number>(Date.now());
  const timerStateRef = useRef(timerState);

  useEffect(() => {
    timerStateRef.current = timerState;
  }, [timerState]);

  useEffect(() => {
    if (settings) {
      setNewWorkDuration(settings.pomodoroDuration);
      setNewBreakDuration(settings.shortBreakDuration);
    }
  }, [settings]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      if (timerStateRef.current.isRunning) {
        setElapsedTimes(prev => {
          const newTimes = {
            ...prev,
            [timerStateRef.current.type]: Math.round((prev[timerStateRef.current.type] + elapsed) * 100) / 100,
          };
          localStorage.setItem('elapsedTimes', JSON.stringify(newTimes));
          return newTimes;
        });
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateTimerInterval = setInterval(() => {
      if (timerStateRef.current.isRunning) {
        const now = Date.now();
        const elapsed = Math.floor((now - timerStateRef.current.lastUpdated) / 1000);
        const newTime = Math.max(0, timerStateRef.current.time - elapsed);
        if (newTime !== timerStateRef.current.time) {
          setTime(newTime);
        }
      }
    }, 1000);

    return () => clearInterval(updateTimerInterval);
  }, [setTime]);

  useEffect(() => {
    if (timerState.isRunning) {
      lastTickRef.current = Date.now();
    }
  }, [timerState.isRunning]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleTimeEdit = (newTime: number) => {
    setTime(newTime);
  };

  const handleToggleTimer = useCallback(() => {
    toggleTimer();
  }, [toggleTimer]);

  const handleStopTimer = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  const handleResetTimer = useCallback(() => {
    resetTimer();
    setElapsedTimes({ work: 0, break: 0 });
    localStorage.setItem('elapsedTimes', JSON.stringify({ work: 0, break: 0 }));
  }, [resetTimer]);

  const handleAddBreak = useCallback(() => {
    addToTimerQueue({
      time: newBreakDuration * 60,
      isRunning: false,
      lastUpdated: Date.now(),
      type: 'break',
    });
  }, [addToTimerQueue, newBreakDuration]);

  const handleAddWork = useCallback(() => {
    addToTimerQueue({
      time: newWorkDuration * 60,
      isRunning: false,
      lastUpdated: Date.now(),
      type: 'work',
    });
  }, [addToTimerQueue, newWorkDuration]);

  const handleWorkDurationChange = useCallback(
    (value: number) => {
      setNewWorkDuration(value);
      setSettings({ pomodoroDuration: value });
    },
    [setSettings],
  );

  const handleBreakDurationChange = useCallback(
    (value: number) => {
      setNewBreakDuration(value);
      setSettings({ shortBreakDuration: value });
    },
    [setSettings],
  );

  const handleSkipToBreak = useCallback(() => {
    const remainingWorkTime = timerStateRef.current.time;
    setElapsedTimes(prev => {
      const newTimes = {
        ...prev,
        work: prev.work + (settings?.pomodoroDuration * 60 - remainingWorkTime),
      };
      localStorage.setItem('elapsedTimes', JSON.stringify(newTimes));
      return newTimes;
    });
    skipToBreak();
  }, [skipToBreak, settings?.pomodoroDuration]);

  const handleSkipToWork = useCallback(() => {
    const remainingBreakTime = timerStateRef.current.time;
    setElapsedTimes(prev => {
      const newTimes = {
        ...prev,
        break: prev.break + (settings?.shortBreakDuration * 60 - remainingBreakTime),
      };
      localStorage.setItem('elapsedTimes', JSON.stringify(newTimes));
      return newTimes;
    });
    skipToWork();
  }, [skipToWork, settings?.shortBreakDuration]);

  const isWorkActive = timerState.type === 'work';
  const hasNextWork = timerQueue.some(timer => timer.type === 'work');
  const hasNextBreak = timerQueue.some(timer => timer.type === 'break');

  if (!timerState || !timerQueue || !settings) {
    return null;
  }

  return (
    <div className={`flex flex-col h-full ${isLight ? 'text-foreground' : 'dark:text-foreground'}`}>
      <TimerDisplay
        time={timerState.time}
        type={timerState.type}
        elapsedWorkTime={elapsedTimes.work}
        elapsedBreakTime={elapsedTimes.break}
        onTimeEdit={handleTimeEdit}
        formatTime={formatTime}
      />

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

      <TimerQueue
        currentTimer={timerState}
        queue={timerQueue}
        onRemove={removeFromTimerQueue}
        formatTime={formatTime}
      />
    </div>
  );
};

export default TimerTab;
