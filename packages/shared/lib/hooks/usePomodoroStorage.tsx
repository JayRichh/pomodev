import { useEffect, useState } from 'react';
import { pomodoroStorage } from '@extension/storage';
import type {
  PomodoroState,
  TimerState,
  Task,
  BreakInterval,
  Settings,
  Priority,
  SortBy,
} from '../../../storage/lib/pomodoroStorage';

type PomodoroStorageHook = PomodoroState &
  Omit<typeof pomodoroStorage, keyof PomodoroState> & {
    filterPriority: Priority | 'all';
    setFilterPriority: (priority: Priority | 'all') => void;
    sortBy: SortBy;
    setSortBy: (sortBy: SortBy) => void;
    searchText: string;
    setSearchText: (text: string) => void;
    getElapsedWorkTime: () => number;
    setElapsedWorkTime: (time: number) => void;
    getElapsedBreakTime: () => number;
    setElapsedBreakTime: (time: number) => void;
  };

export function usePomodoroStorage(): PomodoroStorageHook {
  const [state, setState] = useState<PomodoroState>(() => {
    const snapshot = pomodoroStorage.getSnapshot();
    return snapshot !== null ? snapshot : getInitialState();
  });

  const [timerState, setTimerState] = useState<TimerState>(state.timerState);
  const [tasks, setTasks] = useState<Task[]>(state.tasks);
  const [hideCompleted, setHideCompleted] = useState<boolean>(state.hideCompleted);
  const [breakIntervals, setBreakIntervals] = useState<BreakInterval[]>(state.breakIntervals);
  const [timerQueue, setTimerQueue] = useState<TimerState[]>(state.timerQueue);
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'settings'>(state.activeTab);
  const [settings, setSettings] = useState<Settings>(state.settings);
  const [allTasksCollapsed, setAllTasksCollapsed] = useState<boolean>(state.allTasksCollapsed);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>(state.expandedTasks);
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>(state.filterPriority);
  const [sortBy, setSortBy] = useState<SortBy>(state.sortBy || { field: 'createdAt', order: 'asc' });
  const [searchText, setSearchText] = useState<string>(state.searchText);
  const [elapsedWorkTime, setElapsedWorkTime] = useState<number>(state.elapsedWorkTime);
  const [elapsedBreakTime, setElapsedBreakTime] = useState<number>(state.elapsedBreakTime);

  useEffect(() => {
    const unsubscribe = pomodoroStorage.subscribe(() => {
      const newState = pomodoroStorage.getSnapshot();
      if (newState !== null) {
        setState(newState);
        setTimerState(newState.timerState);
        setTasks(newState.tasks);
        setHideCompleted(newState.hideCompleted);
        setBreakIntervals(newState.breakIntervals);
        setTimerQueue(newState.timerQueue);
        setActiveTab(newState.activeTab);
        setSettings(newState.settings);
        setAllTasksCollapsed(newState.allTasksCollapsed);
        setExpandedTasks(newState.expandedTasks);
        setFilterPriority(newState.filterPriority);
        setSortBy(newState.sortBy);
        setSearchText(newState.searchText);
        setElapsedWorkTime(newState.elapsedWorkTime);
        setElapsedBreakTime(newState.elapsedBreakTime);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    pomodoroStorage.set({
      timerState,
      tasks,
      hideCompleted,
      breakIntervals,
      timerQueue,
      activeTab,
      settings,
      allTasksCollapsed,
      expandedTasks,
      filterPriority,
      sortBy,
      searchText,
      elapsedWorkTime,
      elapsedBreakTime,
    });
  }, [
    timerState,
    tasks,
    hideCompleted,
    breakIntervals,
    timerQueue,
    activeTab,
    settings,
    allTasksCollapsed,
    expandedTasks,
    filterPriority,
    sortBy,
    searchText,
    elapsedWorkTime,
    elapsedBreakTime,
  ]);

  const getElapsedWorkTime = () => elapsedWorkTime;
  const getElapsedBreakTime = () => elapsedBreakTime;

  return {
    ...state,
    ...pomodoroStorage,
    timerState,
    tasks,
    hideCompleted,
    breakIntervals,
    timerQueue,
    activeTab,
    settings,
    allTasksCollapsed,
    expandedTasks,
    filterPriority,
    setFilterPriority,
    sortBy,
    setSortBy,
    searchText,
    setSearchText,
    getElapsedWorkTime,
    setElapsedWorkTime,
    getElapsedBreakTime,
    setElapsedBreakTime,
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
    expandedTasks: {},
    filterPriority: 'all',
    sortBy: { field: 'createdAt', order: 'asc' },
    searchText: '',
    elapsedWorkTime: 0,
    elapsedBreakTime: 0,
  };
}

export type { PomodoroState, TimerState, Task, BreakInterval, Settings, Priority, SortBy };
