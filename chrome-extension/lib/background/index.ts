import 'webextension-polyfill';
import { pomodoroStorage } from '@extension/storage';
import { PomodoroState, TimerState } from '@extension/storage/lib/pomodoroStorage';

const ALARM_KEY = 'pomodoroTimer';
const CHECK_INTERVAL = 1000;

const WORK_COLOR: chrome.action.ColorArray = [220, 53, 69, 255];
const BREAK_COLOR: chrome.action.ColorArray = [40, 167, 69, 255];
const PAUSED_COLOR: chrome.action.ColorArray = [108, 117, 125, 255];

let intervalId: number | null = null;

type TimerType = 'work' | 'break' | 'paused';

function formatTimeForBadge(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function updateBadge(remainingTime: number, totalTime: number, type: TimerType): Promise<void> {
  let badgeText: string;
  let badgeColor: chrome.action.ColorArray;

  switch (type) {
    case 'work':
      badgeText = formatTimeForBadge(remainingTime);
      badgeColor = WORK_COLOR;
      break;
    case 'break':
      badgeText = formatTimeForBadge(remainingTime);
      badgeColor = BREAK_COLOR;
      break;
    case 'paused':
      badgeText = 'PAUSE';
      badgeColor = PAUSED_COLOR;
      break;
  }

  await chrome.action.setBadgeText({ text: badgeText });
  await chrome.action.setBadgeBackgroundColor({ color: badgeColor });
}

async function checkTimer(): Promise<void> {
  try {
    const state = await pomodoroStorage.get();
    if (!state || !state.timerState) {
      throw new Error('Invalid state');
    }

    const { timerState } = state;
    if (timerState.isRunning) {
      const elapsed = Math.floor((Date.now() - timerState.lastUpdated) / 1000);
      const remainingTime = Math.max(0, timerState.time - elapsed);
      await updateBadge(remainingTime, timerState.time, timerState.type);

      if (remainingTime <= 0) {
        await handleTimerCompletion(state);
      } else if (remainingTime <= 30) {
        await pomodoroStorage.clearAlarm(ALARM_KEY);
      }
    } else {
      await updateBadge(timerState.time, timerState.time, 'paused');
    }
  } catch (error) {
    console.error('Error in checkTimer:', error);
    await updateBadge(0, 0, 'paused');
  }
}

async function handleTimerCompletion(state: PomodoroState): Promise<void> {
  await pomodoroStorage.stopTimer();
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('pomodev-logo-128.png'),
    title: 'Pomodoro Timer',
    message: `${state.timerState.type === 'work' ? 'Work' : 'Break'} session completed!`,
  });
  await startNextSession();
}

async function handleAlarm(alarm: chrome.alarms.Alarm): Promise<void> {
  if (alarm.name === ALARM_KEY) {
    const state = await pomodoroStorage.get();
    if (state?.timerState?.isRunning) {
      await handleTimerCompletion(state);
    }
  }
}

async function startNextSession(): Promise<void> {
  try {
    const state = await pomodoroStorage.get();
    const settings = await pomodoroStorage.getSettings();
    if (!state || !settings) {
      throw new Error('Failed to retrieve state or settings');
    }

    let nextTimerState: TimerState;
    if (state.timerQueue.length > 0) {
      nextTimerState = {
        ...state.timerQueue[0],
        isRunning: true,
        lastUpdated: Date.now(),
      };
      await pomodoroStorage.set(currentState => ({
        ...currentState,
        timerState: nextTimerState,
        timerQueue: currentState.timerQueue.slice(1),
      }));
    } else if (state.timerState.type === 'work') {
      const nextBreak = state.breakIntervals[0];
      if (!nextBreak) {
        throw new Error('No break interval available');
      }
      nextTimerState = {
        time: nextBreak.duration,
        isRunning: true,
        lastUpdated: Date.now(),
        type: 'break',
      };
      await pomodoroStorage.set(currentState => ({
        ...currentState,
        timerState: nextTimerState,
      }));
    } else {
      nextTimerState = {
        time: settings.pomodoroDuration * 60,
        isRunning: true,
        lastUpdated: Date.now(),
        type: 'work',
      };
      await pomodoroStorage.set(currentState => ({
        ...currentState,
        timerState: nextTimerState,
      }));
    }

    await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: nextTimerState.time / 60 });
    await updateBadge(nextTimerState.time, nextTimerState.time, nextTimerState.type);
  } catch (error) {
    console.error('Error in startNextSession:', error);
    await updateBadge(0, 0, 'paused');
  }
}

chrome.alarms.onAlarm.addListener(handleAlarm);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleMessage = async () => {
    try {
      switch (message.type) {
        case 'START_TIMER':
          startTimerCheck();
          await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: Math.max(0.5, message.time / 60) });
          await updateBadge(message.time, message.time, message.timerType);
          break;
        case 'PAUSE_TIMER':
        case 'STOP_TIMER':
          stopTimerCheck();
          await pomodoroStorage.clearAlarm(ALARM_KEY);
          await updateBadge(message.time, message.time, 'paused');
          break;
        case 'RESET_TIMER':
          stopTimerCheck();
          await pomodoroStorage.clearAlarm(ALARM_KEY);
          await updateBadge(message.time, message.time, 'paused');
          break;
        case 'TIME_UPDATED':
          if (message.isRunning) {
            await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: message.time / 60 });
          } else {
            await pomodoroStorage.clearAlarm(ALARM_KEY);
          }
          break;
        case 'TIMER_UPDATED':
          startTimerCheck();
          await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: message.timerState.time / 60 });
          await updateBadge(message.timerState.time, message.timerState.time, message.timerState.type);
          break;
        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
      sendResponse({ success: true });
    } catch (error) {
      console.error(`Error handling message ${message.type}:`, error);
      sendResponse({ success: false, error: (error as Error).message });
    }
  };

  handleMessage();
  return true;
});

function startTimerCheck(): void {
  if (intervalId === null) {
    intervalId = setInterval(checkTimer, CHECK_INTERVAL) as unknown as number;
  }
}

function stopTimerCheck(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

chrome.runtime.onStartup.addListener(async () => {
  try {
    const state = await pomodoroStorage.get();

    if (state.timerState.isRunning) {
      startTimerCheck();
      const elapsed = Math.floor((Date.now() - state.timerState.lastUpdated) / 1000);
      const remainingTime = Math.max(0, state.timerState.time - elapsed);

      if (remainingTime > 30) {
        await pomodoroStorage.createAlarm(ALARM_KEY, { delayInMinutes: remainingTime / 60 });
      } else if (remainingTime > 0) {
        // If less than 30 seconds remaining, don't create an alarm, just let the interval handle it
        startTimerCheck();
      } else {
        // Timer should have ended while browser was closed
        await handleTimerCompletion(state);
      }

      await updateBadge(remainingTime, state.timerState.time, state.timerState.type);
    } else {
      await updateBadge(state.timerState.time, state.timerState.time, 'paused');
    }
  } catch (error) {
    console.error('Error on startup:', error);
    await updateBadge(0, 0, 'paused');
  }
});

chrome.runtime.onSuspend.addListener(async () => {
  stopTimerCheck();
  await pomodoroStorage.clearAlarm(ALARM_KEY);
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes['pomodoro-storage-key']) {
    const newValue = changes['pomodoro-storage-key'].newValue;
    if (newValue?.settings) {
      pomodoroStorage.updateTimerStateBasedOnSettings().catch(console.error);
    }
  }
});
