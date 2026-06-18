/* eslint-disable @next/next/no-img-element */
'use client';

import { useState } from 'react';
import { type Group } from '@/types';

interface EditGroupModalProps {
  group: Group;
  onSave: (updatedGroup: Group) => void;
  onClose: () => void;
  allTags: string[];
}

export default function EditGroupModal({ group, onSave, onClose, allTags }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [relatedTags, setRelatedTags] = useState<string[]>(
    group.tags.slice(1)
  );
  const [inputTag, setInputTag] = useState('');
  const [image, setImage] = useState(group.image);
  const [error, setError] = useState('');

  const handleAddTag = () => {
    const trimmed = inputTag.trim().toLowerCase();
    if (trimmed && !relatedTags.includes(trimmed)) {
      setRelatedTags(prev => [...prev, trimmed]);
    }
    setInputTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setRelatedTags(prev => prev.filter(t => t !== tag));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Название группы не может быть пустым');
      return;
    }

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

          {/* Связанные теги */}
          <div style={{ marginBottom: '12px' }}>
            <label>Связанные теги:</label>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px', marginTop: '4px' }}>
              {relatedTags.map(tag => (
                <span key={tag} style={{
                  background: '#859c5e',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: 'transparent', border: 'none', color: 'white',
                      cursor: 'pointer', fontWeight: 'bold',
                      borderRadius: '8px'
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="text"
                placeholder="Добавить тег"
                value={inputTag}
                onChange={e => setInputTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                list="group-related-tags-list"
                style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }}
              />
              <datalist id="group-related-tags-list">
                {allTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={handleAddTag}
                style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}
              >
                Добавить
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Картинка (URL или файл):</label>
            <input
              type="text"
              value={image}
              onChange={e => setImage(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
              placeholder="URL"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: '4px' }}
            />
            {image && (
              <div style={{
                width: '360px',
                height: '360px',
                borderRadius: '4px',
                overflow: 'hidden',
                marginTop: '8px'
              }}>
                <img
                  src={image}
                  alt="preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                background: '#fff'
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 14px',
                borderRadius: '4px',
                background: '#859c5e',
                color: 'white',
                border: 'none'
              }}
            >
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}