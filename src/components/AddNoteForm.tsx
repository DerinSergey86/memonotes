/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useRef } from 'react';
import { type Note, type LocationTag } from '@/types';

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
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

interface AddNoteFormProps {
  onAdd: (note: Note) => void;
  allTags: string[];
  locationTags: LocationTag[];
  onRequestNewLocation: (listType: 'enter' | 'exit') => void;
  autoAddTag: { listType: 'enter' | 'exit'; tagId: string } | null;
  onAutoAddHandled: () => void;
}

function AddNoteForm({ onAdd, allTags, locationTags, onRequestNewLocation, autoAddTag, onAutoAddHandled }: AddNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'task'>('note');
  const [enterLocationTagIds, setEnterLocationTagIds] = useState<string[]>([]);
  const [exitLocationTagIds, setExitLocationTagIds] = useState<string[]>([]);
  const [enterInput, setEnterInput] = useState('');
  const [exitInput, setExitInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ... оставлены без изменений: useEffect для autoAddTag, handleAddTag, handleRemoveTag, addLocationTag

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imagePreview) return;

    let finalContent = content.trim();
    if (imagePreview) {
      finalContent = finalContent ? `${finalContent}\n${imagePreview}` : imagePreview;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.trim() || finalContent.slice(0, 50),
      content: finalContent,
      tags: tagsArray,
      type: noteType,
      createdAt: new Date().toISOString(),
      enterLocationTagIds: enterLocationTagIds,
      exitLocationTagIds: exitLocationTagIds,
    };

    onAdd(newNote);
    setTitle('');
    setContent('');
    setTagsArray([]);
    setEnterLocationTagIds([]);
    setExitLocationTagIds([]);
    setImagePreview(null);
    setNoteType('note');
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setTagsArray([]);
    setInputTag('');
    setEnterLocationTagIds([]);
    setExitLocationTagIds([]);
    setImagePreview(null);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input type="submit" style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button type="button" onClick={handleClear} className="btn" style={{ border: '1px solid #ccc', background: '#f0f0f0' }}>
          Очистить
        </button>
        <input
          type="text"
          placeholder="Заголовок заметки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          style={{ flex: 1 }}
        />
      </div>
      {/* Поле ввода с иконкой камеры */}
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <textarea
          placeholder="Текст заметки или ссылка"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="form-input"
          style={{ width: '100%', paddingRight: '40px' }}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handlePhotoSelect}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={{
            position: 'absolute',
            right: '8px',
            bottom: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            opacity: 0.7,
          }}
          title="Прикрепить фото"
        >
          📷
        </button>
      </div>
      {/* Превью фото */}
      {imagePreview && (
        <div style={{ marginBottom: '8px', position: 'relative', display: 'inline-block' }}>
          <img src={imagePreview} alt="preview" style={{ maxWidth: '150px', borderRadius: '8px', border: '1px solid #ccc' }} />
          <button
            type="button"
            onClick={handleRemoveImage}
            style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
      )}
      {/* остальные блоки: теги, тип, геометки — без изменений */}
      {/* ... */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <button type="submit" className="btn" style={{ border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
          Добавить заметку
        </button>
      </div>
    </form>
  );
}

export default AddNoteForm;