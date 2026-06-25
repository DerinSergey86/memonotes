/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { type LocationTag } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('./LocationPickerMap'), {
  ssr: false,
});

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 300;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas error')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = () => reject(new Error('Image load error'));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsDataURL(file);
  });
}

interface AddressFormModalProps {
  onSave: (data: {
    name: string;
    address?: string;
    radius: number;
    latitude: number | null;
    longitude: number | null;
    image?: string;
  }) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
  initial?: LocationTag | null;
}

export default function AddressFormModal({ onSave, onClose, onDelete, initial }: AddressFormModalProps) {
  const [name, setName] = useState(initial?.name || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [radius, setRadius] = useState(initial?.radius?.toString() || '50');
  const [latitude, setLatitude] = useState<number | null>(initial?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initial?.longitude || null);
  const [image, setImage] = useState(initial?.image || '');
  const [localError, setLocalError] = useState('');
  const [gettingCoords, setGettingCoords] = useState(false);

  const { getPosition } = useGeolocation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      setLocalError('');
    } catch {
      setLocalError('Не удалось обработать изображение');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Название обязательно');
      return;
    }
    onSave({
      name: name.trim(),
      address: address.trim() || undefined,
      radius: parseFloat(radius) || 50,
      latitude,
      longitude,
      image: image.trim() || undefined,
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>{initial ? 'Редактировать адрес' : 'Новый адрес'}</h3>
        {localError && <p style={{ color: 'red' }}>{localError}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label>Название:</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Адрес (необязательно):</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', marginTop: '4px' }} placeholder="ул. Пушкина, 1" />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Радиус (м):</label>
            <input type="number" value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', marginTop: '4px' }} />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Картинка (URL или файл):</label>
            <input type="text" value={image} onChange={e => setImage(e.target.value)} style={{ width: '100%', marginTop: '4px' }} placeholder="https://..." />
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginTop: '4px' }} />
            {image && (
              <div style={{ width: '360px', height: '360px', borderRadius: '4px', overflow: 'hidden', marginTop: '8px' }}>
                <img src={image} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>
          <button type="button" onClick={async () => {
            setGettingCoords(true);
            try {
              const coords = await getPosition();
              setLatitude(coords.latitude);
              setLongitude(coords.longitude);
            } catch { setLocalError('Не удалось получить координаты'); }
            finally { setGettingCoords(false); }
          }} disabled={gettingCoords} style={{ marginBottom: '12px', padding: '4px 8px' }}>
            {gettingCoords ? 'Поиск...' : '📍 Определить местоположение'}
          </button>
          <div style={{ marginBottom: '12px' }}>
            <label>Выберите точку на карте:</label>
            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
                setLocalError('');
              }}
              radius={parseFloat(radius) || 50}
            />
            {latitude && longitude && (
              <p style={{ fontSize: '12px', color: 'green', marginTop: '4px' }}>
                ✅ Координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            {initial && onDelete && (
              <button type="button" onClick={() => { if (window.confirm('Удалить адрес?')) { onDelete(initial.id); onClose(); } }} style={{ color: 'red', padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}>Удалить</button>
            )}
            <button type="button" onClick={onClose} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}>Отмена</button>
            <button type="submit" style={{ padding: '6px 14px', borderRadius: '4px', background: '#859c5e', color: 'white', border: 'none' }}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}