import 'webextension-polyfill';
import { exampleThemeStorage, pomodoroStorage } from '@extension/storage';

let timerInterval: number | undefined;

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

const svgIcon = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="28" stroke="#4A5568" stroke-width="4"/>
    <path d="M32 16V32L42 42" stroke="#4A5568" stroke-width="4" stroke-linecap="round"/>
  </svg>
  `)}`;
  
  function updateTimer() {
    
    pomodoroStorage.get().then((state) => {
      if (state.timerState.isRunning) {
        const now = Date.now();
        const elapsed = Math.floor((now - state.timerState.lastUpdated) / 1000);
        const newTime = Math.max(0, state.timerState.time - elapsed);
        
        if (newTime !== state.timerState.time) {
          pomodoroStorage.setTime(newTime);
        }
        
        if (newTime === 0) {
          pomodoroStorage.toggleTimer();
          chrome.notifications.create({
            type: 'basic',
            iconUrl: chrome.runtime.getURL("icon-34.png"),
            title: 'Pomodoro Timer',
            message: 'Time is up! Take a break.',
          });
        }
      }
    });
  }
  
function startTimer() {
  if (!timerInterval) {
    if (typeof self !== 'undefined' && self.setInterval) {
      timerInterval = self.setInterval(updateTimer, 1000) as unknown as number;
    } else if (typeof global !== 'undefined' && global.setInterval) {
      timerInterval = global.setInterval(updateTimer, 1000) as unknown as number;
    }
  }
}

function stopTimer() {
  if (timerInterval) {
    if (typeof self !== 'undefined' && self.clearInterval) {
      self.clearInterval(timerInterval);
    } else if (typeof global !== 'undefined' && global.clearInterval) {
      global.clearInterval(timerInterval);
    }
    timerInterval = undefined;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    startTimer();
  } else if (message.type === 'STOP_TIMER') {
    stopTimer();
  } else if (message.type === 'GET_TIME_REMAINING') {
    pomodoroStorage.get().then((state) => {
      sendResponse({ timeRemaining: state.timerState.time, isRunning: state.timerState.isRunning });
    });
    return true; // Indicates that the response is asynchronous
  }
});

chrome.runtime.onInstalled.addListener(() => {
  startTimer(); // Start the timer when the extension is installed or updated
});

chrome.runtime.onSuspend.addListener(() => {
  stopTimer();
});

console.log('background loaded');
console.log("Edit 'chrome-extension/lib/background/index.ts' and save to reload.");