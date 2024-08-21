import 'webextension-polyfill';
import { pomodoroStorage } from '@extension/storage';

let timerInterval: number | undefined;

function logMessage(level: 'info' | 'warn' | 'error', message: string, context: object = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}`, context);
}

async function updateTimer() {
  const state = await pomodoroStorage.get();
  const settings = await pomodoroStorage.getSettings();
  if (state.timerState.isRunning) {
    const now = Date.now();
    const elapsed = Math.floor((now - state.timerState.lastUpdated) / 1000);
    const newTime = Math.max(0, state.timerState.time - elapsed);
    
    if (newTime !== state.timerState.time) {
      await pomodoroStorage.setTime(newTime);
    }
    
    if (newTime === 0) {
      await pomodoroStorage.stopTimer();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL("pomodev-logo-128.png"),
        title: 'Pomodoro Timer',
        message: `${state.timerState.type === 'work' ? 'Work' : 'Break'} session completed!`,
      });
      await startNextSession();
    }
  }
}

async function startNextSession() {
  const state = await pomodoroStorage.get();
  const settings = await pomodoroStorage.getSettings();
  if (state.timerQueue.length > 0) {
    const nextSession = state.timerQueue[0];
    await pomodoroStorage.set((currentState) => ({
      ...currentState,
      timerState: {
        ...nextSession,
        isRunning: true,
        lastUpdated: Date.now(),
      },
      timerQueue: currentState.timerQueue.slice(1),
    }));
    logMessage('info', 'Starting next session from timerQueue', { nextSession });
    startTimer();
  } else if (state.timerState.type === 'work') {
    const nextBreak = state.breakIntervals[0];
    if (nextBreak) {
      await pomodoroStorage.set((currentState) => ({
        ...currentState,
        timerState: {
          time: nextBreak.duration,
          isRunning: true,
          lastUpdated: Date.now(),
          type: 'break',
        },
      }));
      logMessage('info', 'Starting next break', { nextBreak });
      startTimer();
    }
  } else {
    await pomodoroStorage.set((currentState) => ({
      ...currentState,
      timerState: {
        time: settings.pomodoroDuration * 60,
        isRunning: true,
        lastUpdated: Date.now(),
        type: 'work',
      },
    }));
    logMessage('info', 'Starting new work session');
    startTimer();
  }
}

function startTimer() {
  stopTimer();
  timerInterval = setInterval(updateTimer, 1000) as unknown as number;
  logMessage('info', 'Timer started');
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = undefined;
    logMessage('info', 'Timer stopped');
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    startTimer();
    sendResponse({ success: true });
    logMessage('info', 'Timer started via message');
  } else if (message.type === 'STOP_TIMER') {
    stopTimer();
    sendResponse({ success: true });
    logMessage('info', 'Timer stopped via message');
  } else if (message.type === 'RESET_TIMER') {
    stopTimer();
    sendResponse({ success: true });
    logMessage('info', 'Timer reset via message');
  } else if (message.type === 'UPDATE_SETTINGS') {
    pomodoroStorage.setSettings(message.settings).then(() => {
      sendResponse({ success: true });
      logMessage('info', 'Settings updated via message', { settings: message.settings });
    });
    
  }
});

chrome.runtime.onInstalled.addListener(() => {
  logMessage('info', 'Pomodoro extension installed or updated');
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes['pomodoro-storage-key']) {
    const newValue = changes['pomodoro-storage-key'].newValue;
    if (newValue && newValue.settings) {
      pomodoroStorage.updateTimerStateBasedOnSettings().then(() => {
        logMessage('info', 'Timer state updated based on new settings');
      });
    }
  }
});

chrome.runtime.onStartup.addListener(async () => {
  const state = await pomodoroStorage.get();
  const settings = await pomodoroStorage.getSettings();
  if (state.timerState.isRunning) {
    startTimer();
    logMessage('info', 'Pomodoro timer resumed after browser startup');
  } else {
    logMessage('info', 'Pomodoro timer not started as it was paused/stopped before');
  }
  logMessage('info', 'Current settings', { settings });
});

chrome.runtime.onSuspend.addListener(() => {
  stopTimer();
  logMessage('info', 'Pomodoro timer suspended due to browser shutdown');
});

logMessage('info', 'Background script loaded');
