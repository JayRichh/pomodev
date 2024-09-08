//packages\shared\lib\hooks\usePomodoroStorage.tsx
import { useEffect, useState } from 'react';
import { pomodoroStorage } from '@extension/storage';
import type { PomodoroState, TimerState, Task, BreakInterval, Settings } from '../../../storage/lib/pomodoroStorage';

type PomodoroStorageHook = PomodoroState & Omit<typeof pomodoroStorage, keyof PomodoroState>;

export function usePomodoroStorage(): PomodoroStorageHook {
  const [state, setState] = useState<PomodoroState>(() => {
    const snapshot = pomodoroStorage.getSnapshot();
    return snapshot !== null ? snapshot : getInitialState();
  });

  useEffect(() => {
    const unsubscribe = pomodoroStorage.subscribe(() => {
      const newState = pomodoroStorage.getSnapshot();
      if (newState !== null) {
        setState(newState);
      }
    });

    return unsubscribe;
  }, []);

  return {
    ...state,
    ...pomodoroStorage,
  };
}

function getInitialState(): PomodoroState {
  return {
    timerState: { time: 25 * 60, isRunning: false, lastUpdated: Date.now(), type: 'work' },
    tasks: [],
    hideCompleted: false,
    breakIntervals: [{ id: '1', duration: 5 * 60 }],
    timerQueue: [],
    activeTab: 'timer',
    settings: {
      pomodoroDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
    },
    allTasksCollapsed: false,
    setTasks: async tasks => {
      const currentState = await pomodoroStorage.get();
      const newState = { ...currentState, tasks };
      await pomodoroStorage.set(newState);
    },
  };
}

export type { PomodoroState, TimerState, Task, BreakInterval, Settings };
