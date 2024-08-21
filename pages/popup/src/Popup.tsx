import React, { useState } from 'react';
import '@src/Popup.css';
import { useStorageSuspense, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import TimerTab from './components/TimerTab';
import TasksTab from './components/TasksTab';
import SettingsTab from './components/SettingsTab';

type Tab = 'Timer' | 'Tasks' | 'Settings';

const Popup: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Timer');
  const theme = useStorageSuspense(exampleThemeStorage);
  const isLight = theme === 'light';

  return (
    <div className={`w-full h-full flex flex-col ${isLight ? 'text-gray-900' : 'bg-gray-800 text-gray-100'}`}>
      <nav className="flex justify-between relative bg-transparent">
        <div
          className={`absolute top-0 bottom-0 left-0 transition-all duration-500 ease-in-out transform 
            ${activeTab === 'Timer' ? 'w-1/3 translate-x-0' :
              activeTab === 'Tasks' ? 'w-1/3 translate-x-full' :
              'w-1/3 translate-x-[200%]'} 
            ${isLight ? 'bg-orange-500' : 'bg-orange-400'} opacity-90 shadow-lg
          `}
        />
        {(['Timer', 'Tasks', 'Settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-lg font-bold z-10 transition-all duration-300 transform tracking-wider 
              ${activeTab === tab
                ? `${isLight ? 'text-gray-900' : 'text-white'} scale-105`
                : `${isLight ? 'text-gray-700 hover:text-gray-900' : 'text-gray-300 hover:text-white'}`}
            `}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="flex-grow flex flex-col p-4 overflow-hidden min-h-[520px]">        
        {activeTab === 'Timer' && <TimerTab />}
        {activeTab === 'Tasks' && <TasksTab />}
        {activeTab === 'Settings' && <SettingsTab />}
      </div>
    </div>
  );
};

export default withErrorBoundary(
  withSuspense(Popup, <div className="flex items-center justify-center h-full">Loading...</div>),
  <div className="flex items-center justify-center h-full text-red-500">An error occurred</div>
);
