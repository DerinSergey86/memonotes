// src/components/EditGroupModal.tsx
'use client';

import { useState } from 'react';
import { type Group } from '@/types';

interface EditGroupModalProps {
  group: Group;
  onSave: (updatedGroup: Group) => void;
  onClose: () => void;
}

export default function EditGroupModal({ group, onSave, onClose }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [tagsString, setTagsString] = useState(group.tags.slice(1).join(', ')); // все теги, кроме основного (первого)
  const [image, setImage] = useState(group.image);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Название группы не может быть пустым');
      return;
    }
    const relatedTags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');
    const updatedGroup: Group = {
      ...group,
      name: name.trim(),
      image: image,
      tags: [name.trim().toLowerCase(), ...relatedTags.map(t => t.toLowerCase())],
    };
    onSave(updatedGroup);
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
        <h3>{group.id ? 'Редактирование группы' : 'Новая группа'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label>Название (основной тег):</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>Связанные теги (через запятую):</label>
            <input
              type="text"
              value={tagsString}
              onChange={e => setTagsString(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <label>URL картинки:</label>
            <input
              type="text"
              value={image}
              onChange={e => setImage(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" onClick={onClose} style={{ padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}>Отмена</button>
            <button type="submit" style={{ padding: '6px 14px', borderRadius: '4px', background: '#859c5e', color: 'white', border: 'none' }}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}