import { createStorage, StorageType, BaseStorage } from './base';

interface TimerState {
  time: number;
  isRunning: boolean;
  lastUpdated: number;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface PomodoroState {
  timerState: TimerState;
  tasks: Task[];
  hideCompleted: boolean;
}

type PomodoroStorage = BaseStorage<PomodoroState> & {
  toggleTimer: () => Promise<void>;
  resetTimer: () => Promise<void>;
  setTime: (time: number) => Promise<void>;
  addTask: (text: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  updateTask: (id: string, text: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleHideCompleted: () => Promise<void>;
};

const initialState: PomodoroState = {
  timerState: { time: 25 * 60, isRunning: false, lastUpdated: Date.now() },
  tasks: [],
  hideCompleted: false,
};

const storage = createStorage<PomodoroState>('pomodoro-storage-key', initialState, {
  storageType: StorageType.Local,
  liveUpdate: true,
});

export const pomodoroStorage: PomodoroStorage = {
  ...storage,
  toggleTimer: async () => {
    await storage.set((currentState) => ({
      ...currentState,
      timerState: {
        ...currentState.timerState,
        isRunning: !currentState.timerState.isRunning,
        lastUpdated: Date.now(),
      },
    }));
  },
  resetTimer: async () => {
    await storage.set((currentState) => ({
      ...currentState,
      timerState: { time: 25 * 60, isRunning: false, lastUpdated: Date.now() },
    }));
  },
  setTime: async (time: number) => {
    await storage.set((currentState) => ({
      ...currentState,
      timerState: { ...currentState.timerState, time, lastUpdated: Date.now() },
    }));
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
};
