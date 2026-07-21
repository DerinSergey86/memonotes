/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';

export function useNativeGeolocation() {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getPosition = useCallback(async (): Promise<{ latitude: number; longitude: number }> => {
    try {
      setLoading(true);
      setError(null);
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
      const coords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      return coords;
    } catch (err: any) {
      setError(err.message || 'Ошибка геолокации');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { latitude, longitude, error, loading, getPosition };
}