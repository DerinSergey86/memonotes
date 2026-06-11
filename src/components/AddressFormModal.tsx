'use client'

import { useState } from 'react';
import { type LocationTag } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';

interface AddressFormModalProps {
  onSave: (data: {
  name: string;
  address: string;
  radius: number;
  latitude: number | null;
  longitude: number | null;
}) => void;
  onClose: () => void;
  initial?: LocationTag | null;
}

export default function AddressFormModal({ onSave, onClose, initial }: AddressFormModalProps) {
  const [name, setName] = useState(initial?.name || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [radius, setRadius] = useState(initial?.radius?.toString() || '50');
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude || null);
  const [localError, setLocalError] = useState('');
  const [gettingCoords, setGettingCoords] = useState(false);
  

  const { getPosition } = useGeolocation();


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      setLocalError('Название и адрес обязательны');
      return;
    }
    onSave({
      name: name.trim(),
  address: address.trim(),
  radius: parseFloat(radius) || 50,
  latitude,
  longitude,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        <h3>{initial ? 'Редактировать адрес' : 'Новый адрес'}</h3>
        {localError && <p style={{ color: 'red' }}>{localError}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label>Название:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Адрес:</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Радиус (м):</label>
            <input type="number" value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
          </div>
          <button type="button" onClick={async () => {
  setGettingCoords(true);
  try {
    const coords = await getPosition();
    setLatitude(coords.latitude);
    setLongitude(coords.longitude);
  } catch  {
    setLocalError('Не удалось получить координаты');
  } finally {
    setGettingCoords(false);
  }
}} disabled={gettingCoords} style={{ marginTop: '4px', padding: '4px 8px' }}>
  {gettingCoords ? 'Поиск...' : '📍 Определить моё местоположение'}
</button>
            <div style={{ marginBottom: '12px' }}>
  <label>Выберите точку на карте:</label>
  </div>
  {latitude && longitude && (
  <div style={{ marginBottom: '12px' }}>
    <iframe
      src={`https://yandex.ru/map-widget/v1/?ll=${longitude}%2C${latitude}&z=16&pt=${longitude},${latitude},pm2rdl`}
      width="100%"
      height="200"
      style={{ border: 0, borderRadius: '8px' }}
      allowFullScreen
    />
    <p style={{ fontSize: '12px', color: 'green', marginTop: '4px' }}>
      ✅ Координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}
    </p>
  </div>
)}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose}>Отмена</button>
            <div style={{ marginBottom: '12px' }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <input
      type="checkbox"
    />
    Уведомлять при входе
  </label>
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
    <input
      type="checkbox"
    />
    Уведомлять при выходе
  </label>
</div>
            <button type="submit">Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}