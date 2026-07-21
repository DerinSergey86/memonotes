'use client';

import { useEffect, useRef, useCallback } from 'react';
import { type LocationTag, type Note } from '@/types';
import { getDistanceFromLatLngInMeters } from '@/lib/distance';
import { useNativeGeolocation } from './useNativeGeolocation';
import { LocalNotifications } from '@capacitor/local-notifications';

interface UseGeofencingProps {
  locationTags: LocationTag[];
  notes: Note[];
  enabled: boolean;
}

export function useGeofencing({ locationTags, notes, enabled }: UseGeofencingProps) {
  const { latitude, longitude, getPosition } = useNativeGeolocation();
  const notifiedTags = useRef<Set<string>>(new Set()); // ← надёжный способ избежать дублей
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const showNotification = async (title: string, body: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Math.floor(Math.random() * 100000),
          schedule: { at: new Date() },
        }],
      });
    } catch (e) {
      console.error('Notification error:', e);
    }
  };

  const checkGeofences = useCallback(() => {
    if (!latitude || !longitude || !enabled) return;

    locationTags.forEach(tag => {
      if (!tag.latitude || !tag.longitude || !tag.radius) return;

      const distance = getDistanceFromLatLngInMeters(latitude, longitude, tag.latitude, tag.longitude);
      const inside = distance <= tag.radius;

      const hasActiveTasks = notes.some(note =>
        note.type === 'task' && !note.completed &&
        ((inside && note.enterLocationTagIds?.includes(tag.id)) ||
         (!inside && note.exitLocationTagIds?.includes(tag.id)))
      );
      if (!hasActiveTasks) return;

      const alreadyNotified = notifiedTags.current.has(tag.id);
      if (inside && !alreadyNotified) {
        showNotification(`📍 Вы вошли в зону "${tag.name}"`, `Есть активные задачи`);
        notifiedTags.current.add(tag.id);
      } else if (!inside && alreadyNotified) {
        showNotification(`🚪 Вы покинули зону "${tag.name}"`, `Есть активные задачи`);
        notifiedTags.current.delete(tag.id);
      }
    });
  }, [latitude, longitude, enabled, locationTags, notes]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      notifiedTags.current.clear(); // Сбрасываем историю при выключении
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

  useEffect(() => {
    if (latitude && longitude) checkGeofences();
  }, [latitude, longitude, checkGeofences]);

  return {
    startWatching: () => getPosition(),
    stopWatching: () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      notifiedTags.current.clear();
    },
  };
}