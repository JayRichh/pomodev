import { createStorage, StorageType, BaseStorage, ValueOrUpdate } from './base';

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
  priority: 'low' | 'medium' | 'high';
  children: Task[];
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

export type Priority = 'low' | 'medium' | 'high';
export type SortBy = {
  field: 'createdAt' | 'priority' | 'alphabetical';
  order: 'asc' | 'desc';
};

export interface PomodoroState {
  timerState: TimerState;
  tasks: Task[];
  hideCompleted: boolean;
  breakIntervals: BreakInterval[];
  timerQueue: TimerState[];
  settings: Settings;
  allTasksCollapsed: boolean;
  activeTab: 'timer' | 'tasks' | 'settings';
  expandedTasks: Record<string, boolean>;
  filterPriority: Priority | 'all';
  sortBy: SortBy;
  searchText: string;
}

type PomodoroStorage = BaseStorage<PomodoroState> & {
  toggleTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  setTime: (time: number) => Promise<void>;
  addTask: (text: string, priority: Priority) => Promise<void>;
  setTasks: (tasks: Task[]) => Promise<void>;
  deleteAllTasks: () => Promise<void>;
  toggleCollapseAll: () => Promise<void>;
  setActiveTab: (tab: 'timer' | 'tasks' | 'settings') => Promise<void>;
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
  skipToBreak: () => Promise<void>;
  skipToWork: () => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  updateTaskTree: (updateFn: (tasks: Task[]) => Task[]) => Promise<void>;
  addChildTask: (parentId: string, text: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskPriority: (id: string, priority: Task['priority']) => Promise<void>;
  setExpandedTasks: (expandedTasks: Record<string, boolean>) => Promise<void>;
  toggleTaskExpanded: (taskId: string) => Promise<void>;
};

function toggleTaskInTree(tasks: Task[], taskId: string): Task[] {
  return tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, completed: !task.completed };
    }
    if (task.children.length > 0) {
      return { ...task, children: toggleTaskInTree(task.children, taskId) };
    }
    return task;
  });
}

function updateTaskInTree(tasks: Task[], taskId: string, updates: Partial<Task>): Task[] {
  return tasks.map(task => {
    if (task.id === taskId) {
      return { ...task, ...updates };
    }
    if (task.children.length > 0) {
      return { ...task, children: updateTaskInTree(task.children, taskId, updates) };
    }
    return task;
  });
}

function addChildTaskInTree(tasks: Task[], parentId: string, text: string): Task[] {
  return tasks.map(task => {
    if (task.id === parentId) {
      return {
        ...task,
        children: [
          ...task.children,
          { id: Date.now().toString(), text, completed: false, priority: 'medium', children: [] },
        ],
      };
    }
    if (task.children.length > 0) {
      return { ...task, children: addChildTaskInTree(task.children, parentId, text) };
    }
    return task;
  });
}

function deleteTaskInTree(tasks: Task[], taskId: string): Task[] {
  return tasks
    .filter(task => task.id !== taskId)
    .map(task => {
      if (task.children.length > 0) {
        return { ...task, children: deleteTaskInTree(task.children, taskId) };
      }
      return task;
    });
}

const initialState: PomodoroState = {
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
  expandedTasks: {},
  filterPriority: 'all',
  sortBy: { field: 'createdAt', order: 'asc' },
  searchText: '',
};

const storage = createStorage<PomodoroState>('pomodoro-storage-key', initialState, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

async function getPersistentState(): Promise<PomodoroState> {
  try {
    const state = await storage.get();
    return state ? { ...initialState, ...state } : initialState;
  } catch (error) {
    console.error('Error retrieving state:', error);
    return initialState;
  }
}

async function setPersistentState(value: ValueOrUpdate<PomodoroState>): Promise<void> {
  try {
    await storage.set(value);
  } catch (error) {
    console.error('Error setting state:', error);
  }
}
export const pomodoroStorage: PomodoroStorage = {
  ...storage,

  get: getPersistentState,
  set: setPersistentState,

  setActiveTab: async tab => {
    await setPersistentState(prevState => ({
      ...prevState,
      activeTab: tab,
    }));
  },

  toggleTimer: async () => {
    await setPersistentState(async currentState => {
      const now = Date.now();
      const newIsRunning = !currentState.timerState.isRunning;
      let newTime = currentState.timerState.time;
      const newQueue = [...currentState.timerQueue];
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

      const newState = {
        ...currentState,
        timerState: {
          ...currentState.timerState,
          isRunning: newIsRunning,
          lastUpdated: now,
          time: newTime,
          type: newType,
        },
        timerQueue: newQueue,
      };

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

      return newState;
    });
  },

  skipToBreak: async () => {
    await setPersistentState(async currentState => {
      if (currentState.timerState.type !== 'work' || currentState.timerQueue.length === 0) {
        return currentState;
      }

      const nextBreak = currentState.timerQueue.find(timer => timer.type === 'break');
      if (!nextBreak) {
        return currentState;
      }

      const newState = {
        ...currentState,
        timerState: {
          ...nextBreak,
          isRunning: currentState.timerState.isRunning,
          lastUpdated: Date.now(),
        },
        timerQueue: currentState.timerQueue.filter(timer => timer !== nextBreak),
      };

      if (currentState.timerState.isRunning) {
        await pomodoroStorage.createAlarm('pomodoroTimer', { delayInMinutes: nextBreak.time / 60 });
      }

      chrome.runtime.sendMessage({ type: 'TIMER_UPDATED', timerState: nextBreak });

      return newState;
    });
  },

  skipToWork: async () => {
    await setPersistentState(async currentState => {
      if (currentState.timerState.type !== 'break' || currentState.timerQueue.length === 0) {
        return currentState;
      }

      const nextWork = currentState.timerQueue.find(timer => timer.type === 'work');
      if (!nextWork) {
        return currentState;
      }

      const newState = {
        ...currentState,
        timerState: {
          ...nextWork,
          isRunning: currentState.timerState.isRunning,
          lastUpdated: Date.now(),
        },
        timerQueue: currentState.timerQueue.filter(timer => timer !== nextWork),
      };

      if (currentState.timerState.isRunning) {
        await pomodoroStorage.createAlarm('pomodoroTimer', { delayInMinutes: nextWork.time / 60 });
      }

      chrome.runtime.sendMessage({ type: 'TIMER_UPDATED', timerState: nextWork });

      return newState;
    });
  },

  stopTimer: async () => {
    await setPersistentState(currentState => ({
      ...currentState,
      timerState: {
        ...initialState.timerState,
        isRunning: false,
        lastUpdated: Date.now(),
      },
    }));
    await pomodoroStorage.clearAlarm('pomodoroTimer');
    chrome.runtime.sendMessage({ type: 'STOP_TIMER' });
  },

  resetTimer: async () => {
    const settings = await pomodoroStorage.getSettings();
    await setPersistentState(currentState => ({
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
    await setPersistentState(async currentState => {
      const newState = {
        ...currentState,
        timerState: { ...currentState.timerState, time, lastUpdated: Date.now() },
      };
      if (currentState.timerState.isRunning) {
        await pomodoroStorage.createAlarm('pomodoroTimer', { delayInMinutes: time / 60 });
      }
      chrome.runtime.sendMessage({ type: 'TIME_UPDATED', time });
      return newState;
    });
  },

  updateTaskPriority: async (id: string, priority: Task['priority']) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: updateTaskInTree(currentState.tasks, id, { priority }),
    }));
  },

  deleteAllTasks: async () => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: [],
    }));
  },

  toggleCollapseAll: async () => {
    await setPersistentState(currentState => ({
      ...currentState,
      allTasksCollapsed: !currentState.allTasksCollapsed,
    }));
  },

  setTasks: async (tasks: Task[]) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks,
    }));
  },

  addTask: async (text: string, priority: Task['priority']) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: [...currentState.tasks, { id: Date.now().toString(), text, completed: false, priority, children: [] }],
    }));
  },

  toggleTask: async (taskId: string) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: toggleTaskInTree(currentState.tasks, taskId),
    }));
  },

  updateTask: async (taskId: string, updates: Partial<Task>) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: updateTaskInTree(currentState.tasks, taskId, updates),
    }));
  },

  updateTaskTree: async (updateFn: (tasks: Task[]) => Task[]) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: updateFn(currentState.tasks),
    }));
  },

  addChildTask: async (parentId: string, text: string) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: addChildTaskInTree(currentState.tasks, parentId, text),
    }));
  },

  deleteTask: async (taskId: string) => {
    await setPersistentState(currentState => ({
      ...currentState,
      tasks: deleteTaskInTree(currentState.tasks, taskId),
    }));
  },

  toggleHideCompleted: async () => {
    await setPersistentState(currentState => ({
      ...currentState,
      hideCompleted: !currentState.hideCompleted,
    }));
  },

  addBreakInterval: async (duration: number) => {
    await setPersistentState(currentState => ({
      ...currentState,
      breakIntervals: [...currentState.breakIntervals, { id: Date.now().toString(), duration }],
    }));
  },

  updateBreakInterval: async (id: string, duration: number) => {
    await setPersistentState(currentState => ({
      ...currentState,
      breakIntervals: currentState.breakIntervals.map(interval =>
        interval.id === id ? { ...interval, duration } : interval,
      ),
    }));
  },

  deleteBreakInterval: async (id: string) => {
    await setPersistentState(currentState => ({
      ...currentState,
      breakIntervals: currentState.breakIntervals.filter(interval => interval.id !== id),
    }));
  },

  addToTimerQueue: async (timerState: TimerState) => {
    await setPersistentState(currentState => ({
      ...currentState,
      timerQueue: [...currentState.timerQueue, timerState],
    }));
  },

  removeFromTimerQueue: async (index: number) => {
    await setPersistentState(currentState => ({
      ...currentState,
      timerQueue: currentState.timerQueue.filter((_, i) => i !== index),
    }));
  },

  setSettings: async (settings: Partial<Settings>) => {
    await setPersistentState(currentState => ({
      ...currentState,
      settings: { ...currentState.settings, ...settings },
    }));
  },

  getSettings: async () => {
    const currentState = await getPersistentState();
    return currentState.settings;
  },

  updateTimerStateBasedOnSettings: async () => {
    await setPersistentState(currentState => {
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
        return {
          ...currentState,
          timerState: { ...timerState, time: newTime },
        };
      }

      return currentState;
    });
  },

  setExpandedTasks: async (expandedTasks: Record<string, boolean>) => {
    await setPersistentState(currentState => ({
      ...currentState,
      expandedTasks,
    }));
  },

  toggleTaskExpanded: async (taskId: string) => {
    await setPersistentState(currentState => ({
      ...currentState,
      expandedTasks: {
        ...currentState.expandedTasks,
        [taskId]: !currentState.expandedTasks[taskId],
      },
    }));
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
