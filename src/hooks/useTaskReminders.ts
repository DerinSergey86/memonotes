/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { type Note } from '@/types';
import { LocalNotifications } from '@capacitor/local-notifications';

const INTERVALS_MINUTES = [1440, 2880, 4320]; // 1 день, 2 дня, 3 дня

interface StoredData {
  lastIndex: number;
  lastTimestamp: number;
}

function getStoredData(): StoredData {
  if (typeof window === 'undefined') return { lastIndex: -1, lastTimestamp: 0 };
  try {
    const raw = localStorage.getItem('taskReminders');
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lastIndex: -1, lastTimestamp: 0 };
}

function storeData(data: StoredData) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('taskReminders', JSON.stringify(data));
}

export function useTaskReminders(notes: Note[], enabled: boolean) {
  const [stored, setStored] = useState<StoredData>({ lastIndex: -1, lastTimestamp: 0 });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Загружаем сохранённое состояние при старте
  useEffect(() => {
    setStored(getStoredData());
  }, []);

  const activeTaskCount = notes.filter(n => n.type === 'task' && !n.completed).length;

  // Основной эффект управления таймером
  useEffect(() => {
    // Если геозоны выключены или задач нет — сбрасываем всё и выходим
    if (!enabled || activeTaskCount === 0) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      // Сбрасываем сохранённый прогресс
      const reset: StoredData = { lastIndex: -1, lastTimestamp: 0 };
      setStored(reset);
      storeData(reset);
      return;
    }

    // Рассчитываем задержку до следующего уведомления
    const now = Date.now();
    const nextIndex = stored.lastIndex < INTERVALS_MINUTES.length - 1 ? stored.lastIndex + 1 : stored.lastIndex;
    const intervalMs = INTERVALS_MINUTES[nextIndex] * 60 * 1000;
    const timeSinceLast = now - stored.lastTimestamp;
    const delay = stored.lastTimestamp === 0 ? 0 : Math.max(intervalMs - timeSinceLast, 0);

    // Устанавливаем таймер
    const timeout = setTimeout(async () => {
      const tasksLeft = notes.filter(n => n.type === 'task' && !n.completed).length;
      try {
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Здравствуйте!',
            body: `У вас ${tasksLeft} невыполненных задач.`,
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date() },
          }],
        });
      } catch (e) {
        console.error('Ошибка отправки напоминания:', e);
      }
      const updated: StoredData = { lastIndex: nextIndex, lastTimestamp: Date.now() };
      setStored(updated);
      storeData(updated);
    }, delay);

    intervalRef.current = timeout;

    // Очистка при размонтировании или изменении зависимостей
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [enabled, activeTaskCount, stored, notes]);
}