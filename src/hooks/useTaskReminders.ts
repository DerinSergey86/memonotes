/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { type Note } from '@/types';

// Интервалы в минутах: 1 день, 2 дня, затем каждые 3 дня
const INTERVALS_MINUTES = [1, 1440, 2880, 4320];

function getStoredData(): { lastIndex: number; lastTimestamp: number } {
  if (typeof window === 'undefined') return { lastIndex: -1, lastTimestamp: 0 };
  try {
    const raw = localStorage.getItem('taskReminders');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lastIndex: -1, lastTimestamp: 0 };
}

function storeData(data: { lastIndex: number; lastTimestamp: number }) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('taskReminders', JSON.stringify(data));
}

export function useTaskReminders(notes: Note[], enabled: boolean) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [stored, setStored] = useState(getStoredData);

  const activeTaskCount = notes.filter(n => n.type === 'task' && !n.completed).length;

  // Сбрасываем счётчик, если задач не осталось
  useEffect(() => {
    if (activeTaskCount === 0 && stored.lastIndex >= 0) {
      setStored({ lastIndex: -1, lastTimestamp: 0 });
      storeData({ lastIndex: -1, lastTimestamp: 0 });
    }
  }, [activeTaskCount, stored.lastIndex]);

  useEffect(() => {
    if (!enabled || activeTaskCount === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const now = Date.now();
    // Выбираем следующий индекс (но не больше последнего)
    const nextIndex = stored.lastIndex < INTERVALS_MINUTES.length - 1
      ? stored.lastIndex + 1
      : INTERVALS_MINUTES.length - 1;
    const intervalMs = INTERVALS_MINUTES[nextIndex] * 60 * 1000; // переводим минуты в мс

    // Когда отправлять следующее уведомление
    const timeSinceLast = now - stored.lastTimestamp;
    const delay = stored.lastTimestamp === 0 ? 0 : Math.max(intervalMs - timeSinceLast, 0);

    const timeout = setTimeout(() => {
      if (Notification.permission === 'granted') {
        const tasksLeft = notes.filter(n => n.type === 'task' && !n.completed).length;
        new Notification('Здравствуйте!', {
          body: `У вас ${tasksLeft} невыполненных задач.`,
          icon: '/icons/icon-192x192.png',
        });
      }
      const updated = { lastIndex: nextIndex, lastTimestamp: Date.now() };
      setStored(updated);
      storeData(updated);
    }, delay);

    intervalRef.current = timeout;

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [enabled, activeTaskCount, stored, notes]);
}