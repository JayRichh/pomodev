import React, { useState, useEffect } from 'react';
import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import TimerTab from './components/TimerTab';
import TasksTab from './components/TasksTab';
import SettingsTab from './components/SettingsTab';
import { usePomodoroStorage } from '@extension/shared/lib/hooks/usePomodoroStorage';

type Tab = 'timer' | 'tasks' | 'settings';

const Popup: React.FC = () => {
  const { activeTab: storedActiveTab, setActiveTab: setStoredActiveTab } = usePomodoroStorage();
  const [activeTab, setActiveTab] = useState<Tab>(storedActiveTab);
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';
  useEffect(() => {
    if (isLight) {
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
    }

    document.body.style.backgroundColor = isLight ? 'hsl(var(--background))' : 'hsl(var(--background))';
    document.body.style.color = isLight ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))';
  }, [isLight]);
  useEffect(() => {
    setStoredActiveTab(activeTab);
  }, [activeTab, setStoredActiveTab]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className={`w-full h-full flex flex-col ${isLight ? 'bg-background text-foreground' : 'bg-gray-800 text-white'}`}>
      <nav className="flex justify-between relative bg-transparent">
        <div
          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ease-in-out transform 
            ${
              activeTab === 'timer'
                ? 'w-1/3 translate-x-0'
                : activeTab === 'tasks'
                  ? 'w-1/3 translate-x-full'
                  : 'w-1/3 translate-x-[200%]'
            }
            ${isLight ? 'bg-primary opacity-90 shadow-lg' : 'bg-gray-600 opacity-90 shadow-lg'}
          `}
        />
        {(['timer', 'tasks', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`flex-1 py-3 text-lg font-bold z-10 transition-all duration-300 transform tracking-wider
              ${activeTab === tab ? (isLight ? 'text-primary-foreground scale-105' : 'text-blue-400 scale-105') : isLight ? 'text-muted-foreground hover:text-foreground' : 'text-gray-400 hover:text-white'}
            `}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
      <div
        className={`content-container flex-grow overflow-auto ${activeTab === 'tasks' ? 'p-0' : 'p-4'} ${isLight ? 'bg-background' : 'bg-gray-800'}`}>
        {activeTab === 'timer' && <TimerTab />}
        {activeTab === 'tasks' && <TasksTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="flex items-center justify-center h-full">Loading...</div>),
  <div className="flex items-center justify-center h-full text-destructive">An error occurred</div>,
);
