import React, { useState, useEffect, useCallback } from 'react';
import { usePomodoroStorage } from '@extension/shared';
import { pomodoroStorage, exampleThemeStorage } from '@extension/storage';
import { Sun, Moon } from 'lucide-react';

const SettingsTab: React.FC = () => {
  const pomodoroState = usePomodoroStorage();
  const theme = exampleThemeStorage.getSnapshot();
  const isLight = theme === 'light';

  const defaultSettings = {
    pomodoroDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
  };

  const [localSettings, setLocalSettings] = useState(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (pomodoroState?.settings) {
      setLocalSettings(pomodoroState.settings);
    }
  }, []);

  const handleSettingChange = useCallback((key: keyof typeof defaultSettings, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  }, []);

  const applySettings = useCallback(async () => {
    await pomodoroStorage.setSettings(localSettings);
    setIsDirty(false);
  }, [localSettings]);

  const cancelChanges = useCallback(() => {
    if (pomodoroState?.settings) {
      setLocalSettings(pomodoroState.settings);
    }
    setIsDirty(false);
  }, [pomodoroState?.settings]);

  const resetSettings = useCallback(async () => {
    await pomodoroStorage.setSettings(defaultSettings);
    setLocalSettings(defaultSettings);
    setIsDirty(false);
  }, []);

  const toggleTheme = useCallback(() => {
    exampleThemeStorage.toggle();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Settings</h2>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {isLight ? <Moon className="text-gray-800" size={24} /> : <Sun className="text-gray-200" size={24} />}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-4 -mr-4">
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Timer Settings</h3>
          <div className="space-y-4">
            <NumberSetting
              label="Pomodoro Duration (minutes)"
              value={localSettings.pomodoroDuration}
              onChange={(value) => handleSettingChange('pomodoroDuration', value)}
              isLight={isLight}
            />
            <NumberSetting
              label="Short Break Duration (minutes)"
              value={localSettings.shortBreakDuration}
              onChange={(value) => handleSettingChange('shortBreakDuration', value)}
              isLight={isLight}
            />
            <NumberSetting
              label="Long Break Duration (minutes)"
              value={localSettings.longBreakDuration}
              onChange={(value) => handleSettingChange('longBreakDuration', value)}
              isLight={isLight}
            />
            <NumberSetting
              label="Long Break Interval"
              value={localSettings.longBreakInterval}
              onChange={(value) => handleSettingChange('longBreakInterval', value)}
              isLight={isLight}
            />
          </div>
        </section>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <span className={`text-sm font-medium ${isDirty ? 'text-yellow-500' : 'text-green-500'}`}>
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button 
            onClick={resetSettings}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Reset to Defaults
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={cancelChanges}
            disabled={!isDirty}
            className={`flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 
              ${isDirty 
                ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' 
                : 'opacity-50 cursor-not-allowed'}`}
          >
            Cancel
          </button>
          <button
            onClick={applySettings}
            disabled={!isDirty}
            className={`flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 
              ${isDirty 
                ? 'bg-blue-500 text-white dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700' 
                : 'opacity-50 cursor-not-allowed'}`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

const NumberSetting: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  isLight: boolean;
}> = ({ label, value, onChange, isLight }) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-20 p-1 rounded border ${
          isLight 
            ? 'text-black border-gray-300 bg-white' 
            : 'text-white bg-gray-700 border-gray-600'
        }`}
      />
    </div>
  );
};

export default SettingsTab;