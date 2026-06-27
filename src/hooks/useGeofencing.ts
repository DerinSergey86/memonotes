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
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icons/icon-192x192.png' });
    }
  };

  const checkGeofences = useCallback(() => {
    if (!latitude || !longitude || !enabled) return;

    locationTags.forEach(tag => {
      if (!tag.latitude || !tag.longitude || !tag.radius || !tag.enabled) return;

      const distance = getDistanceFromLatLngInMeters(latitude, longitude, tag.latitude, tag.longitude);
      const inside = distance <= tag.radius;
      const alreadyNotified = notifiedTags.has(tag.id);

      const hasActiveTasks = notes.some(note =>
        note.type === 'task' && !note.completed &&
        ((inside && note.enterLocationTagIds?.includes(tag.id)) ||
         (!inside && note.exitLocationTagIds?.includes(tag.id)))
      );

      if (!hasActiveTasks) return;

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
    },
  };
}