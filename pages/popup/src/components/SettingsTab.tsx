import React, { useState, useEffect, useCallback } from 'react';
import { usePomodoroStorage, useStorageSuspense } from '@extension/shared';
import { pomodoroStorage, exampleThemeStorage } from '@extension/storage';
import { Sun, Moon } from 'lucide-react';

const SettingsTab: React.FC = () => {
  const pomodoroState = usePomodoroStorage();
  const theme = useStorageSuspense(exampleThemeStorage);
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
  }, [pomodoroState?.settings]);

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

  return (
    <div
      className={`flex flex-col h-full ${isLight ? 'bg-background text-foreground' : 'bg-background dark:text-foreground'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${isLight ? 'text-foreground' : 'dark:text-foreground'}`}>Settings</h2>
        <button
          onClick={exampleThemeStorage.toggle}
          className={`p-2 rounded-full ${isLight ? 'hover:bg-secondary/80' : 'dark:hover:bg-secondary/80'} transition-colors duration-200`}
          aria-label="Toggle theme">
          {isLight ? (
            <Moon className="text-foreground" size={24} />
          ) : (
            <Sun className="dark:text-foreground" size={24} />
          )}
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-4 -mr-4">
        <section className="mb-8">
          <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-foreground' : 'dark:text-foreground'}`}>
            Timer Settings
          </h3>
          <div className="space-y-4">
            <NumberSetting
              label="Pomodoro Duration (minutes)"
              value={localSettings.pomodoroDuration}
              onChange={value => handleSettingChange('pomodoroDuration', value)}
              isLight={isLight}
            />
            <NumberSetting
              label="Short Break Duration (minutes)"
              value={localSettings.shortBreakDuration}
              onChange={value => handleSettingChange('shortBreakDuration', value)}
              isLight={isLight}
            />
            <NumberSetting
              label="Long Break Duration (minutes)"
              value={localSettings.longBreakDuration}
              onChange={value => handleSettingChange('longBreakDuration', value)}
              isLight={isLight}
            />
            <NumberSetting
              label="Long Break Interval"
              value={localSettings.longBreakInterval}
              onChange={value => handleSettingChange('longBreakInterval', value)}
              isLight={isLight}
            />
          </div>
        </section>
      </div>

      <div className={`mt-auto pt-4 border-t ${isLight ? 'border-border' : 'dark:border-border'}`}>
        <div className="flex justify-between items-center mb-4">
          <span className={`text-sm font-medium ${isDirty ? 'text-destructive' : 'text-primary'}`}>
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <button
            onClick={resetSettings}
            className={`px-3 py-1 text-sm rounded ${
              isLight
                ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                : 'dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80'
            } transition-colors duration-200`}>
            Reset to Defaults
          </button>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={cancelChanges}
            disabled={!isDirty}
            className={`
              flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
              ${
                isDirty
                  ? isLight
                    ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    : 'dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80'
                  : 'opacity-50 cursor-not-allowed'
              }
            `}>
            Cancel
          </button>
          <button
            onClick={applySettings}
            disabled={!isDirty}
            className={`
              flex-1 py-2 px-4 rounded-md shadow hover:shadow-lg transition-all duration-300 text-sm font-medium
              ${
                isDirty
                  ? isLight
                    ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                    : 'dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/80'
                  : 'opacity-50 cursor-not-allowed'
              }
            `}>
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
      <label className={`text-sm font-medium ${isLight ? 'text-foreground' : 'dark:text-foreground'}`}>{label}</label>
      <input
        type="number"
        min="1"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-20 p-1 rounded ${
          isLight
            ? 'text-foreground bg-background border-input'
            : 'dark:text-foreground dark:bg-background dark:border-input'
        } border focus:border-ring focus:ring-1 focus:ring-ring`}
      />
    </div>
  );
};

export default SettingsTab;
