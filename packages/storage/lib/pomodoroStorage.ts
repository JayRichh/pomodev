import { createStorage, StorageType, BaseStorage } from './base';

interface TimerState {
  time: number;
  isRunning: boolean;
  lastUpdated: number;
  type: 'work' | 'break';
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface BreakInterval {
  id: string;
  duration: number;
}

interface Settings {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

interface PomodoroState {
  timerState: TimerState;
  tasks: Task[];
  hideCompleted: boolean;
  breakIntervals: BreakInterval[];
  timerQueue: TimerState[];
  settings: Settings;
}

type PomodoroStorage = BaseStorage<PomodoroState> & {
  toggleTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  setTime: (time: number) => Promise<void>;
  addTask: (text: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, text: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleHideCompleted: () => Promise<void>;
  addBreakInterval: (duration: number) => Promise<void>;
  updateBreakInterval: (id: string, duration: number) => Promise<void>;
  deleteBreakInterval: (id: string) => Promise<void>;
  addToTimerQueue: (timerState: TimerState) => Promise<void>;
  removeFromTimerQueue: (index: number) => Promise<void>;
  setSettings: (settings: Partial<PomodoroState['settings']>) => Promise<void>;
  getSettings: () => Promise<PomodoroState['settings']>;
};

const initialState: PomodoroState = {
  timerState: { time: 25 * 60, isRunning: false, lastUpdated: Date.now(), type: 'work' },
  tasks: [],
  hideCompleted: false,
  breakIntervals: [{ id: '1', duration: 5 * 60 }],
  timerQueue: [],
  settings: {
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  }
};

const storage = createStorage<PomodoroState>('pomodoro-storage-key', initialState, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const pomodoroStorage: PomodoroStorage = {
  ...storage,

  stopTimer: async () => {
    await storage.set((currentState) => ({
      ...currentState,
      timerState: {
        ...currentState.timerState,
        isRunning: false,
        lastUpdated: Date.now(),
      },
    }));
    chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
  },

  toggleTimer: async () => {
    const currentState = await storage.get();
    const now = Date.now();
    const newIsRunning = !currentState.timerState.isRunning;
    let newTime = currentState.timerState.time;
    let newQueue = [...currentState.timerQueue];
    let newType = currentState.timerState.type;

    if (currentState.timerState.isRunning) {
      const elapsed = Math.floor((now - currentState.timerState.lastUpdated) / 1000);
      newTime = Math.max(0, currentState.timerState.time - elapsed);
    }

    if (newTime === 0 && newQueue.length > 0) {
      const nextTimer = newQueue.shift();
      if (nextTimer) {
        newTime = nextTimer.time;
        newType = nextTimer.type;
      }
    }

    await storage.set((state) => ({
      ...state,
      timerState: {
        ...state.timerState,
        isRunning: newIsRunning,
        lastUpdated: now,
        time: newTime,
        type: newType,
      },
      timerQueue: newQueue,
    }));

    chrome.runtime.sendMessage({
      type: newIsRunning ? 'START_TIMER' : 'STOP_TIMER',
    });
  },

  resetTimer: async () => {
    await storage.set((currentState) => ({
      ...currentState,
      timerState: { time: 25 * 60, isRunning: false, lastUpdated: Date.now(), type: 'work' },
      timerQueue: [],
    }));
    chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
  },

  setTime: async (time: number) => {
    await storage.set((currentState) => ({
      ...currentState,
      timerState: { ...currentState.timerState, time, lastUpdated: Date.now() },
    }));
    chrome.runtime.sendMessage({ type: 'TIME_UPDATED', time });
  },
  addTask: async (text: string) => {
    await storage.set((currentState) => ({
      ...currentState,
      tasks: [...currentState.tasks, { id: Date.now().toString(), text, completed: false }],
    }));
  },
  toggleTask: async (id: string) => {
    await storage.set((currentState) => ({
      ...currentState,
      tasks: currentState.tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      ),
    }));
  },
  updateTask: async (id: string, text: string) => {
    await storage.set((currentState) => ({
      ...currentState,
      tasks: currentState.tasks.map((task) =>
        task.id === id ? { ...task, text } : task
      ),
    }));
  },
  deleteTask: async (id: string) => {
    await storage.set((currentState) => ({
      ...currentState,
      tasks: currentState.tasks.filter((task) => task.id !== id),
    }));
  },
  toggleHideCompleted: async () => {
    await storage.set((currentState) => ({
      ...currentState,
      hideCompleted: !currentState.hideCompleted,
    }));
  },
  addBreakInterval: async (duration: number) => {
    await storage.set((currentState) => ({
      ...currentState,
      breakIntervals: [...currentState.breakIntervals, { id: Date.now().toString(), duration }],
    }));
  },
  updateBreakInterval: async (id: string, duration: number) => {
    await storage.set((currentState) => ({
      ...currentState,
      breakIntervals: currentState.breakIntervals.map((interval) =>
        interval.id === id ? { ...interval, duration } : interval
      ),
    }));
  },
  deleteBreakInterval: async (id: string) => {
    await storage.set((currentState) => ({
      ...currentState,
      breakIntervals: currentState.breakIntervals.filter((interval) => interval.id !== id),
    }));
  },
  addToTimerQueue: async (timerState: TimerState) => {
    await storage.set((currentState) => ({
      ...currentState,
      timerQueue: [...currentState.timerQueue, timerState],
    }));
  },
  removeFromTimerQueue: async (index: number) => {
    await storage.set((currentState) => ({
      ...currentState,
      timerQueue: currentState.timerQueue.filter((_, i) => i !== index),
    }));
  },
  setSettings: async (settings: Partial<PomodoroState['settings']>) => {
    await storage.set((currentState) => ({
      ...currentState,
      settings: { ...currentState.settings, ...settings },
    }));
  },
  getSettings: async () => {
    const currentState = await storage.get();
    return currentState.settings;
  },
};
