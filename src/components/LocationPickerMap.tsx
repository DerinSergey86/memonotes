'use client'

import { useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerMapProps {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (lat: number, lng: number) => void;
}

// Компонент, обрабатывающий клики по карте
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange }: LocationPickerMapProps) {
  const defaultCenter: [number, number] = latitude && longitude ? [latitude, longitude] : [55.751244, 37.618423]; // Москва

  const handleMapClick = useCallback((lat: number, lng: number) => {
    onLocationChange(lat, lng);
  }, [onLocationChange]);

  return (
    <MapContainer
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
        <Marker position={[latitude, longitude]} />
      )}
    </MapContainer>
  );
}