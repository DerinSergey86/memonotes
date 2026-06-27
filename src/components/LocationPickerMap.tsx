/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
  radius?: number;
}

function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange, radius }: LocationPickerMapProps) {
  const defaultCenter: [number, number] = latitude && longitude ? [latitude, longitude] : [55.751244, 37.618423];

  const handleMapClick = useCallback((lat: number, lng: number) => {
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  return (
    <>
      <style>{`
        .leaflet-attribution-flag {
          display: none !important;
        }
      `}</style>
      <MapContainer
        key={`${latitude}_${longitude}`}  // ← пересоздаём карту при изменении координат
        center={defaultCenter}
        zoom={13}
        style={{ height: '300px', width: '100%', borderRadius: '8px', marginBottom: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onClick={handleMapClick} />
        {latitude && longitude && (
          <>
            <Marker position={[latitude, longitude]} />
            {radius && radius > 0 && (
              <Circle
                center={[latitude, longitude]}
                radius={radius}
                pathOptions={{ color: '#859c5e', fillColor: '#859c5e', fillOpacity: 0.2 }}
              />
            )}
          </>
        )}
      </MapContainer>
    </>
  );
}