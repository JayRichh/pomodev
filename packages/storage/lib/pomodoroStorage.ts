import { createStorage, StorageType, BaseStorage } from './base';

export interface TimerState {
  time: number;
  isRunning: boolean;
  lastUpdated: number;
  type: 'work' | 'break';
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export interface BreakInterval {
  id: string;
  duration: number;
}

export interface Settings {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
}

export interface PomodoroState {
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
  setSettings: (settings: Partial<Settings>) => Promise<void>;
  getSettings: () => Promise<Settings>;
  updateTimerStateBasedOnSettings: () => Promise<void>;
  createAlarm: (name: string, alarmInfo: chrome.alarms.AlarmCreateInfo) => Promise<void>;
  clearAlarm: (name: string) => Promise<boolean>;
  getAlarm: (name: string) => Promise<chrome.alarms.Alarm | undefined>;
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
  },
};

const storage = createStorage<PomodoroState>('pomodoro-storage-key', initialState, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const pomodoroStorage: PomodoroStorage = {
  ...storage,

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

    await storage.set(state => ({
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

    if (newIsRunning) {
      await pomodoroStorage.createAlarm('pomodoroTimer', { delayInMinutes: newTime / 60 });
    } else {
      await pomodoroStorage.clearAlarm('pomodoroTimer');
    }

    chrome.runtime.sendMessage({
      type: newIsRunning ? 'START_TIMER' : 'PAUSE_TIMER',
      time: newTime,
      timerType: newType,
    });
  },

  stopTimer: async () => {
    await storage.set(currentState => ({
      ...currentState,
      timerState: {
        ...currentState.timerState,
        isRunning: false,
        lastUpdated: Date.now(),
      },
    }));
    await pomodoroStorage.clearAlarm('pomodoroTimer');

    chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
  },

  resetTimer: async () => {
    const settings = await pomodoroStorage.getSettings();
    await storage.set(currentState => ({
      ...currentState,
      timerState: {
        time: settings.pomodoroDuration * 60,
        isRunning: false,
        lastUpdated: Date.now(),
        type: 'work',
      },
      timerQueue: [],
    }));
    await pomodoroStorage.clearAlarm('pomodoroTimer');
    chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
  },

  setTime: async (time: number) => {
    const currentState = await storage.get();
    await storage.set(state => ({
      ...state,
      timerState: { ...state.timerState, time, lastUpdated: Date.now() },
    }));
    if (currentState.timerState.isRunning) {
      await pomodoroStorage.createAlarm('pomodoroTimer', { delayInMinutes: time / 60 });
    }
    chrome.runtime.sendMessage({ type: 'TIME_UPDATED', time });
  },

  addTask: async (text: string) => {
    await storage.set(currentState => ({
      ...currentState,
      tasks: [...currentState.tasks, { id: Date.now().toString(), text, completed: false }],
    }));
  },
  toggleTask: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      tasks: currentState.tasks.map(task => (task.id === id ? { ...task, completed: !task.completed } : task)),
    }));
  },
  updateTask: async (id: string, text: string) => {
    await storage.set(currentState => ({
      ...currentState,
      tasks: currentState.tasks.map(task => (task.id === id ? { ...task, text } : task)),
    }));
  },
  deleteTask: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      tasks: currentState.tasks.filter(task => task.id !== id),
    }));
  },
  toggleHideCompleted: async () => {
    await storage.set(currentState => ({
      ...currentState,
      hideCompleted: !currentState.hideCompleted,
    }));
  },
  addBreakInterval: async (duration: number) => {
    await storage.set(currentState => ({
      ...currentState,
      breakIntervals: [...currentState.breakIntervals, { id: Date.now().toString(), duration }],
    }));
  },
  updateBreakInterval: async (id: string, duration: number) => {
    await storage.set(currentState => ({
      ...currentState,
      breakIntervals: currentState.breakIntervals.map(interval =>
        interval.id === id ? { ...interval, duration } : interval,
      ),
    }));
  },
  deleteBreakInterval: async (id: string) => {
    await storage.set(currentState => ({
      ...currentState,
      breakIntervals: currentState.breakIntervals.filter(interval => interval.id !== id),
    }));
  },
  addToTimerQueue: async (timerState: TimerState) => {
    await storage.set(currentState => ({
      ...currentState,
      timerQueue: [...currentState.timerQueue, timerState],
    }));
  },
  removeFromTimerQueue: async (index: number) => {
    await storage.set(currentState => ({
      ...currentState,
      timerQueue: currentState.timerQueue.filter((_, i) => i !== index),
    }));
  },
  setSettings: async (settings: Partial<Settings>) => {
    await storage.set(currentState => ({
      ...currentState,
      settings: { ...currentState.settings, ...settings },
    }));
  },

  getSettings: async () => {
    const currentState = await storage.get();
    return currentState.settings;
  },

  updateTimerStateBasedOnSettings: async () => {
    const currentState = await storage.get();
    const { settings, timerState } = currentState;

    let newTime = timerState.time;
    if (timerState.type === 'work' && timerState.time === currentState.settings.pomodoroDuration * 60) {
      newTime = settings.pomodoroDuration * 60;
    } else if (timerState.type === 'break') {
      const isLongBreak =
        currentState.breakIntervals.findIndex(interval => interval.duration === timerState.time) === -1;
      if (isLongBreak && timerState.time === currentState.settings.longBreakDuration * 60) {
        newTime = settings.longBreakDuration * 60;
      } else if (!isLongBreak && timerState.time === currentState.settings.shortBreakDuration * 60) {
        newTime = settings.shortBreakDuration * 60;
      }
    }

    if (newTime !== timerState.time) {
      await storage.set(state => ({
        ...state,
        timerState: { ...state.timerState, time: newTime },
      }));
    }
  },

  createAlarm: async (name: string, alarmInfo: chrome.alarms.AlarmCreateInfo) => {
    await chrome.alarms.create(name, alarmInfo);
  },

  clearAlarm: async (name: string) => {
    return await chrome.alarms.clear(name);
  },

  getAlarm: async (name: string) => {
    return await chrome.alarms.get(name);
  },
};
