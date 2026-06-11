'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { type LocationTag, type Note } from '@/types';
import { getDistanceFromLatLngInMeters } from '@/lib/distance';
import { useGeolocation } from './useGeolocation';

interface UseGeofencingProps {
  locationTags: LocationTag[];
  notes: Note[];           // ← передаём список всех заметок
  enabled: boolean;
}

export function useGeofencing({ locationTags, notes, enabled }: UseGeofencingProps) {
  const { latitude, longitude, getPosition } = useGeolocation();
  const [notifiedTags, setNotifiedTags] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192x192.png' });
    }
  };

  // Функция проверки геозон с учётом активных задач
  const checkGeofences = useCallback(() => {
    if (!latitude || !longitude || !enabled) return;

    locationTags.forEach(tag => {
      if (!tag.latitude || !tag.longitude || !tag.radius) return;

      

 const distance = getDistanceFromLatLngInMeters(latitude, longitude, tag.latitude, tag.longitude);
const inside = distance <= tag.radius;
const alreadyNotified = notifiedTags.has(tag.id);

// Проверяем, есть ли задачи, привязанные к этой геометке и не завершённые
      const hasActiveTasks = notes.some(note =>
        note.locationTagId === tag.id &&
        note.type === 'task' &&
        !note.completed &&
        (
    (inside && note.notifyOnEnter) ||
    (!inside && note.notifyOnExit)
  )
      );

      if (!hasActiveTasks) return; // если задач нет, ничего не делаем

if (inside && !alreadyNotified) {
  // Проверяем, есть ли задачи с notifyOnEnter = true
  const enterTasks = notes.some(note =>
    note.locationTagId === tag.id && note.type === 'task' && !note.completed && note.notifyOnEnter
  );
  if (enterTasks) {
    showNotification(`📍 Вы вошли в зону "${tag.name}"`, `Есть активные задачи`);
    setNotifiedTags(prev => new Set(prev).add(tag.id));
  }
} else if (!inside && alreadyNotified) {
  const exitTasks = notes.some(note =>
    note.locationTagId === tag.id && note.type === 'task' && !note.completed && note.notifyOnExit
  );
  if (exitTasks) {
    showNotification(`🚪 Вы покинули зону "${tag.name}"`, `Есть активные задачи`);
    setNotifiedTags(prev => {
      const next = new Set(prev);
      next.delete(tag.id);
      return next;
    });
  }
}

    });
  }, [latitude, longitude, enabled, locationTags, notes, notifiedTags]);

  // Запуск интервала
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    getPosition();
    intervalRef.current = setInterval(() => {
      getPosition();
      setTimeout(checkGeofences, 1000);
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, getPosition, checkGeofences]);

  // Проверка при каждом обновлении координат
  useEffect(() => {
    if (latitude && longitude) checkGeofences();
  }, [latitude, longitude, checkGeofences]);

  return {
    startWatching: () => getPosition(),
    stopWatching: () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
  };
}