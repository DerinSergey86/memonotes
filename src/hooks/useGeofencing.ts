'use client'

import { useEffect, useRef, useState, useCallback } from 'react';
import { type LocationTag, type Note } from '@/types';
import { getDistanceFromLatLngInMeters } from '@/lib/distance';
import { useGeolocation } from './useGeolocation';

interface UseGeofencingProps {
  locationTags: LocationTag[];
  notes: Note[];
  enabled: boolean;
}

export function useGeofencing({ locationTags, notes, enabled }: UseGeofencingProps) {
  const { latitude, longitude, getPosition } = useGeolocation();
  const [notifiedTags, setNotifiedTags] = useState<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = (title: string, body: string) => {
    console.log('Попытка отправить уведомление:', title, body);
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/icons/icon-192x192.png' });
        console.log('Уведомление отправлено');
      } catch (e) {
        console.error('Ошибка отправки уведомления:', e);
      }
    } else {
      console.warn('Нет разрешения на уведомления');
    }
  };

  const checkGeofences = useCallback(() => {
    console.log('Проверка геозон. Координаты:', latitude, longitude, 'enabled:', enabled);
    if (!latitude || !longitude || !enabled) return;

    locationTags.forEach(tag => {
      if (!tag.latitude || !tag.longitude || !tag.radius) return;

      const distance = getDistanceFromLatLngInMeters(latitude, longitude, tag.latitude, tag.longitude);
      const inside = distance <= tag.radius;
      console.log(`Зона "${tag.name}": расстояние ${distance.toFixed(1)}м, внутри: ${inside}`);

      const hasActiveTasks = notes.some(note =>
        note.type === 'task' && !note.completed &&
        ((inside && note.enterLocationTagIds?.includes(tag.id)) ||
         (!inside && note.exitLocationTagIds?.includes(tag.id)))
      );
      console.log(`Активные задачи для входа/выхода: ${hasActiveTasks}`);

      if (!hasActiveTasks) return;

      const alreadyNotified = notifiedTags.has(tag.id);
      if (inside && !alreadyNotified) {
        showNotification(`📍 Вы вошли в зону "${tag.name}"`, `Есть активные задачи`);
        setNotifiedTags(prev => new Set(prev).add(tag.id));
      } else if (!inside && alreadyNotified) {
        showNotification(`🚪 Вы покинули зону "${tag.name}"`, `Есть активные задачи`);
        setNotifiedTags(prev => {
          const next = new Set(prev);
          next.delete(tag.id);
          return next;
        });
      }
    });
  }, [latitude, longitude, enabled, locationTags, notes, notifiedTags]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    getPosition();
    console.log('Запущен интервал проверки геозон');
    intervalRef.current = setInterval(() => {
      getPosition();
      setTimeout(checkGeofences, 1000);
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enabled, getPosition, checkGeofences]);

  useEffect(() => {
    if (latitude && longitude) {
      console.log('Координаты обновлены, проверяем геозоны');
      checkGeofences();
    }
  }, [latitude, longitude, checkGeofences]);

  return {
    startWatching: () => getPosition(),
    stopWatching: () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    },
  };
}