import React, { useState, useEffect, useCallback } from 'react';
import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ComponentPropsWithoutRef } from 'react';

type Tab = 'Timer' | 'Tasks' | 'Settings';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TimerState {
  time: number;
  isRunning: boolean;
  lastUpdated: number;
}

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Timer');
  const [timerState, setTimerState] = useState<TimerState>({ time: 25 * 60, isRunning: false, lastUpdated: Date.now() });
  const [isEditing, setIsEditing] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  useEffect(() => {
    // Load saved state when component mounts
    chrome.storage.local.get(['timerState', 'tasks'], (result) => {
      if (result.timerState) {
        const savedState = result.timerState as TimerState;
        if (savedState.isRunning) {
          const elapsedTime = Math.floor((Date.now() - savedState.lastUpdated) / 1000);
          const newTime = Math.max(0, savedState.time - elapsedTime);
          setTimerState({ ...savedState, time: newTime, lastUpdated: Date.now() });
        } else {
          setTimerState(savedState);
        }
      }
      if (result.tasks) {
        setTasks(result.tasks as Task[]);
      }
    });
  }, []);

  useEffect(() => {
    let interval: number | undefined;
    if (timerState.isRunning && timerState.time > 0) {
      interval = window.setInterval(() => {
        setTimerState((prevState) => {
          const newState = { ...prevState, time: Math.max(0, prevState.time - 1), lastUpdated: Date.now() };
          chrome.storage.local.set({ timerState: newState });
          return newState;
        });
      }, 1000);
    } else if (timerState.time === 0) {
      setTimerState((prevState) => ({ ...prevState, isRunning: false }));
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.time]);

  useEffect(() => {
    // Save timer state whenever it changes
    chrome.storage.local.set({ timerState });
  }, [timerState]);

  useEffect(() => {
    // Save tasks whenever they change
    chrome.storage.local.set({ tasks });
  }, [tasks]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const toggleTimer = () => {
    setTimerState((prevState) => ({ ...prevState, isRunning: !prevState.isRunning, lastUpdated: Date.now() }));
  };
  
  const resetTimer = () => {
    setTimerState({ time: 25 * 60, isRunning: false, lastUpdated: Date.now() });
  };

  const handleTimeEdit = (e: React.FocusEvent<HTMLInputElement>) => {
    const [minutes, seconds] = e.target.value.split(':').map(Number);
    if (!isNaN(minutes) && !isNaN(seconds)) {
      setTimerState((prevState) => ({ ...prevState, time: minutes * 60 + seconds, lastUpdated: Date.now() }));
    }
    setIsEditing(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const addTask = (text: string) => {
    setTasks([...tasks, { id: Date.now().toString(), text, completed: false }]);
  };

  return (
    <div className={`w-full h-full flex flex-col ${isLight ? 'bg-white text-gray-900' : 'bg-gray-900 text-gray-100'}`}>
      <nav className={`flex justify-between p-2 ${isLight ? 'bg-gray-100' : 'bg-gray-800'}`}>
        {(['Timer', 'Tasks', 'Settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-colors duration-300 ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : `${isLight ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-gray-700'}`
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="flex-grow flex flex-col p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200" style={{ minHeight: '400px' }}>
        {activeTab === 'Timer' && (
          <div className="flex-grow flex flex-col items-center justify-center">
            {isEditing ? (
              <input
                type="text"
                defaultValue={formatTime(timerState.time)}
                onBlur={handleTimeEdit}
                className={`text-6xl font-bold mb-8 w-full max-w-xs text-center bg-transparent border-b-2 ${
                  isLight ? 'border-gray-300 focus:border-blue-500' : 'border-gray-700 focus:border-blue-400'
                }`}
                autoFocus
              />
            ) : (
              <h2 
                className="text-6xl font-bold mb-8 cursor-pointer hover:text-blue-500 transition-colors duration-300"
                onClick={() => setIsEditing(true)}
              >
                {formatTime(timerState.time)}
              </h2>
            )}
            <div className="flex justify-center space-x-4">
              <button
                className={`
                  font-bold py-3 px-6 rounded-md shadow hover:shadow-lg transition-all duration-300
                  ${timerState.isRunning
                    ? (isLight ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-700 text-white hover:bg-red-800')
                    : (isLight ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-green-700 text-white hover:bg-green-800')
                  }
                `}
                onClick={toggleTimer}
              >
                {timerState.isRunning ? 'Pause' : 'Start'}
              </button>
              <button
                className={`
                  font-bold py-3 px-6 rounded-md shadow hover:shadow-lg transition-all duration-300
                  ${isLight ? 'bg-gray-300 text-black hover:bg-gray-400' : 'bg-gray-700 text-white hover:bg-gray-600'}
                `}
                onClick={resetTimer}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Tasks' && (
          <div className="flex-grow flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Tasks</h2>
            <ul className="space-y-2 mb-4 flex-grow overflow-y-auto">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center p-2 bg-opacity-50 rounded-md">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mr-2 form-checkbox h-5 w-5 text-blue-500 transition duration-150 ease-in-out"
                  />
                  <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>{task.text}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={(e) => {
              e.preventDefault();
              const input = e.currentTarget.elements.namedItem('newTask') as HTMLInputElement;
              if (input.value.trim()) {
                addTask(input.value.trim());
                input.value = '';
              }
            }} className="flex mt-auto">
              <input
                type="text"
                name="newTask"
                placeholder="Add a new task"
                className={`flex-grow p-2 rounded-l-md ${
                  isLight ? 'bg-gray-100 text-gray-800' : 'bg-gray-800 text-white'
                } border-2 border-r-0 border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 transition-colors duration-300"
              >
                Add
              </button>
            </form>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="flex-grow flex flex-col">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <ToggleButton className="w-full mb-4">Toggle theme</ToggleButton>
            <div className={`p-4 rounded-md ${isLight ? 'bg-gray-100' : 'bg-gray-800'}`}>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-sm">
                This is a Pomodoro timer extension to help you manage your time effectively.
                Use the timer to work in focused intervals and the task list to keep track of your progress.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const ToggleButton: React.FC<ComponentPropsWithoutRef<'button'>> = (props) => {
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  return (
    <button
      {...props}
      className={`
        ${props.className}
        font-bold py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300
        ${isLight 
          ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
          : 'bg-blue-900 text-blue-100 hover:bg-blue-800'}
      `}
      onClick={() => exampleThemeStorage.toggle()}
    >
      {props.children}
    </button>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="flex items-center justify-center h-full">Loading...</div>),
  <div className="flex items-center justify-center h-full text-red-500">An error occurred</div>
);