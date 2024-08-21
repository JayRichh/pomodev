import { useEffect, useState } from 'react';
import { pomodoroStorage } from '@extension/storage';

export function usePomodoroStorage(): ReturnType<typeof pomodoroStorage.getSnapshot> {
  const [state, setState] = useState(pomodoroStorage.getSnapshot());

  useEffect(() => {
    const unsubscribe = pomodoroStorage.subscribe(() => {
      setState(pomodoroStorage.getSnapshot());
    });

    return unsubscribe;
  }, []);

  return state;
}

export type PomodoroState = ReturnType<typeof usePomodoroStorage>;