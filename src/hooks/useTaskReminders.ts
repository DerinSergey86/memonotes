/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { type Note } from '@/types';

const INTERVALS_MINUTES = [1440, 2880, 4320]; // 1 день, 2 дня, затем каждые 3 дня

interface StoredData {
  lastIndex: number;
  lastTimestamp: number;
}

function getStoredData(): StoredData {
  if (typeof window === 'undefined') return { lastIndex: -1, lastTimestamp: 0 };
  try {
    const raw = localStorage.getItem('taskReminders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.lastIndex === 'number' && typeof parsed.lastTimestamp === 'number') {
        return parsed;
      }
    }
  } catch {}
  return { lastIndex: -1, lastTimestamp: 0 };
}

function storeData(data: StoredData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('taskReminders', JSON.stringify(data));
  } catch {}
}

export function useTaskReminders(notes: Note[], enabled: boolean) {
  const [stored, setStored] = useState<StoredData>({ lastIndex: -1, lastTimestamp: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Безопасно читаем localStorage при монтировании
  useEffect(() => {
    setStored(getStoredData());
  }, []);

  const activeTaskCount = notes.filter(n => n.type === 'task' && !n.completed).length;

  // Сброс, если задач не осталось
  useEffect(() => {
    if (activeTaskCount === 0 && stored.lastIndex >= 0) {
      const reset: StoredData = { lastIndex: -1, lastTimestamp: 0 };
      setStored(reset);
      storeData(reset);
    }
  }, [activeTaskCount, stored.lastIndex]);

  useEffect(() => {
    if (!enabled || activeTaskCount === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const now = Date.now();
    const nextIndex = Math.min(stored.lastIndex + 1, INTERVALS_MINUTES.length - 1);
    const intervalMs = INTERVALS_MINUTES[nextIndex] * 60 * 1000;
    const timeSinceLast = now - stored.lastTimestamp;
    const delay = stored.lastTimestamp === 0 ? 0 : Math.max(intervalMs - timeSinceLast, 0);

    const timeout = setTimeout(() => {
      if (typeof window !== 'undefined' && Notification.permission === 'granted') {
        const tasksLeft = notes.filter(n => n.type === 'task' && !n.completed).length;
        try {
          new Notification('Здравствуйте!', {
            body: `У вас ${tasksLeft} невыполненных задач.`,
            icon: '/icons/icon-192x192.png',
          });
        } catch {}
      }
      const updated: StoredData = { lastIndex: nextIndex, lastTimestamp: Date.now() };
      setStored(updated);
      storeData(updated);
    }, delay);

    intervalRef.current = timeout;
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [enabled, activeTaskCount, stored, notes]);
}