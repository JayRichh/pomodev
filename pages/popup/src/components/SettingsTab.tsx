import React from 'react';
import '@src/Popup.css';
import { usePomodoroStorage } from '@extension/shared';
import { pomodoroStorage, exampleThemeStorage } from '@extension/storage';

const SettingsTab: React.FC = () => {
  const pomodoroState = usePomodoroStorage();
  const theme = exampleThemeStorage.getSnapshot();
  const isLight = theme === 'light';

  const handleSettingChange = async (key: string, value: any) => {
    await pomodoroStorage.setSettings({ [key]: value });
  };

  if (!pomodoroState || !pomodoroState.settings) {
    return <div className="flex justify-center items-center h-full">Loading settings...</div>;
  }

  const { settings } = pomodoroState;

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Timer Settings</h3>
        <NumberSetting
          label="Pomodoro Duration (minutes)"
          value={settings.pomodoroDuration}
          onChange={(value) => handleSettingChange('pomodoroDuration', value)}
          isLight={isLight}
        />
        <NumberSetting
          label="Short Break Duration (minutes)"
          value={settings.shortBreakDuration}
          onChange={(value) => handleSettingChange('shortBreakDuration', value)}
          isLight={isLight}
        />
        <NumberSetting
          label="Long Break Duration (minutes)"
          value={settings.longBreakDuration}
          onChange={(value) => handleSettingChange('longBreakDuration', value)}
          isLight={isLight}
        />
        <NumberSetting
          label="Long Break Interval"
          value={settings.longBreakInterval}
          onChange={(value) => handleSettingChange('longBreakInterval', value)}
          isLight={isLight}
        />
      </section>

      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-gray-200">Appearance</h3>
        <ToggleButton 
          className="w-full" 
          onClick={() => exampleThemeStorage.toggle()}
          isLight={isLight}
        >
          Toggle theme
        </ToggleButton>
      </section>

      <section className={`p-4 rounded-md ${isLight ? 'bg-gray-100' : 'bg-gray-800'}`}>
        <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">About</h3>
        <p className="text-sm dark:text-gray-300">
          This Pomodoro timer extension helps you manage your time effectively.
          Use the timer to work in focused intervals and the task list to keep track of your progress.
        </p>
      </section>
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
    <div className="flex items-center justify-between mb-4">
      <label className="text-sm font-medium dark:text-gray-300">{label}</label>
      <input
        type="number"
        min="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`w-20 p-1 rounded border ${
          isLight 
            ? 'text-black border-gray-300' 
            : 'text-white bg-gray-700 border-gray-600'
        }`}
      />
    </div>
  );
};

const ToggleSetting: React.FC<{
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isLight: boolean;
}> = ({ label, checked, onChange, isLight }) => {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium dark:text-gray-300">{label}</label>
      <div
        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer ${
          checked ? 'bg-green-500' : isLight ? 'bg-gray-300' : 'bg-gray-600'
        }`}
        onClick={() => onChange(!checked)}
      >
        <div
          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </div>
    </div>
  );
};

const ToggleButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { isLight: boolean }> = ({ isLight, ...props }) => {
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
    >
      {props.children}
    </button>
  );
};

export default SettingsTab;