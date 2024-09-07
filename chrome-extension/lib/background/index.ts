import 'webextension-polyfill';
import { pomodoroStorage } from '@extension/storage';

const ALARM_KEY = 'pomodoroTimer';
const CHECK_INTERVAL = 1000; // 1 second

let intervalId: number | null = null;
async function checkTimer() {
  const state = await pomodoroStorage.get();
  if (state.timerState.isRunning) {
    const now = Date.now();
    const elapsed = Math.floor((now - state.timerState.lastUpdated) / 1000);
    const remainingTime = Math.max(0, state.timerState.time - elapsed);

    if (remainingTime <= 0) {
      await handleTimerCompletion(state);
    } else if (remainingTime <= 30) {
      // If less than 30 seconds remaining, clear existing alarm and rely on interval
      await pomodoroStorage.clearAlarm(ALARM_KEY);
    }
  }
}
async function handleTimerCompletion(state: any) {
  await pomodoroStorage.stopTimer();
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('pomodev-logo-128.png'),
    title: 'Pomodoro Timer',
    message: `${state.timerState.type === 'work' ? 'Work' : 'Break'} session completed!`,
  });
  await startNextSession();
}
async function handleAlarm(alarm: chrome.alarms.Alarm) {
  if (alarm.name === ALARM_KEY) {
    const state = await pomodoroStorage.get();
    if (state.timerState.isRunning) {
      await handleTimerCompletion(state);
    }
  }
}

async function startNextSession() {
  const state = await pomodoroStorage.get();
  const settings = await pomodoroStorage.getSettings();
  if (state.timerQueue.length > 0) {
    const nextSession = state.timerQueue[0];
    await pomodoroStorage.set(currentState => ({
      ...currentState,
      timerState: {
        ...nextSession,
        isRunning: true,
        lastUpdated: Date.now(),
      },
      timerQueue: currentState.timerQueue.slice(1),
    }));
    await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: nextSession.time / 60 });
    console.log('Starting next session from timerQueue', { nextSession });
  } else if (state.timerState.type === 'work') {
    const nextBreak = state.breakIntervals[0];
    if (nextBreak) {
      await pomodoroStorage.set(currentState => ({
        ...currentState,
        timerState: {
          time: nextBreak.duration,
          isRunning: true,
          lastUpdated: Date.now(),
          type: 'break',
        },
      }));
      await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: nextBreak.duration / 60 });
      console.log('Starting next break', { nextBreak });
    }
  } else {
    await pomodoroStorage.set(currentState => ({
      ...currentState,
      timerState: {
        time: settings.pomodoroDuration * 60,
        isRunning: true,
        lastUpdated: Date.now(),
        type: 'work',
      },
    }));
    await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: settings.pomodoroDuration });
    console.log('Starting new work session');
  }
}

chrome.alarms.onAlarm.addListener(handleAlarm);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    startTimerCheck();
    pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: Math.max(0.5, message.time / 60) }).then(() => {
      sendResponse({ success: true });
      console.log('Timer started', message);
    });
    return true;
  } else if (message.type === 'PAUSE_TIMER' || message.type === 'STOP_TIMER') {
    stopTimerCheck();
    pomodoroStorage.clearAlarm(ALARM_KEY).then(() => {
      sendResponse({ success: true });
      console.log('Timer stopped', message);
    });
    return true;
  } else if (message.type === 'RESET_TIMER') {
    pomodoroStorage.clearAlarm(ALARM_KEY).then(() => {
      sendResponse({ success: true });
      console.log('Timer reset', message);
    });
    return true;
  } else if (message.type === 'TIME_UPDATED') {
    if (message.isRunning) {
      pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: message.time / 60 }).then(() => {
        sendResponse({ success: true });
        console.log('Timer updated', message);
      });
    } else {
      pomodoroStorage.clearAlarm(ALARM_KEY).then(() => {
        sendResponse({ success: true });
        console.log('Timer updated and stopped', message);
      });
    }
    return true;
  }

  return false; // Return false for unknown message types
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Pomodoro extension installed or updated');
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes['pomodoro-storage-key']) {
    const newValue = changes['pomodoro-storage-key'].newValue;
    if (newValue && newValue.settings) {
      pomodoroStorage.updateTimerStateBasedOnSettings().then(() => {
        console.log('Timer state updated based on new settings');
      });
    }
  }
});

function startTimerCheck() {
  if (intervalId === null) {
    intervalId = setInterval(checkTimer, CHECK_INTERVAL) as unknown as number;
  }
}

function stopTimerCheck() {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

chrome.runtime.onStartup.addListener(async () => {
  const state = await pomodoroStorage.get();
  if (state.timerState.isRunning) {
    startTimerCheck();
    const remainingTime = Math.max(0, state.timerState.time - (Date.now() - state.timerState.lastUpdated) / 1000);
    if (remainingTime > 30) {
      await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: remainingTime / 60 });
    }
    console.log('Pomodoro timer resumed after browser startup');
  } else {
    console.log('Pomodoro timer not started as it was paused/stopped before');
  }
});

chrome.runtime.onSuspend.addListener(async () => {
  stopTimerCheck();
  await pomodoroStorage.clearAlarm(ALARM_KEY);
  console.log('Pomodoro timer suspended due to browser shutdown');
});

console.log('Background script loaded');
