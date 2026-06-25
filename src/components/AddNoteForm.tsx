/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect } from 'react';
import { type Note, type LocationTag } from '@/types';

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

  // Автоматическое добавление созданной геометки в нужный список
  useEffect(() => {
    if (autoAddTag) {
      if (autoAddTag.listType === 'enter') {
        setEnterLocationTagIds(prev => prev.includes(autoAddTag.tagId) ? prev : [...prev, autoAddTag.tagId]);
        setEnterInput('');
      } else {
        setExitLocationTagIds(prev => prev.includes(autoAddTag.tagId) ? prev : [...prev, autoAddTag.tagId]);
        setExitInput('');
      }
      onAutoAddHandled();
    }
  }, [autoAddTag, onAutoAddHandled]);

  const handleAddTag = () => {
    const trimmed = inputTag.trim().toLowerCase();
    if (trimmed && !tagsArray.includes(trimmed)) {
      setTagsArray(prev => [...prev, trimmed]);
    }
    setInputTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setTagsArray(prev => prev.filter(t => t !== tag));
  };

  // Универсальная функция добавления геометки (плашки)
  const addLocationTag = (
    input: string,
    currentIds: string[],
    setIds: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    listType: 'enter' | 'exit'
  ) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const found = locationTags.find(tag => tag.name.toLowerCase() === trimmed.toLowerCase());
    if (found) {
      if (!currentIds.includes(found.id)) {
        setIds(prev => [...prev, found.id]);
      }
    } else {
      onRequestNewLocation(listType);
    }
    setInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.trim() || content.trim().slice(0, 50),
      content: content.trim(),
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
    setNoteType('note');
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setTagsArray([]);
    setInputTag('');
    setEnterLocationTagIds([]);
    setExitLocationTagIds([]);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input type="submit" style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button type="button" onClick={handleClear} style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>
          Очистить
        </button>
        <input
          type="text"
          placeholder="Заголовок заметки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }}
        />
      </div>
      <textarea
        placeholder="Текст заметки или ссылка"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        style={{ width: '100%', marginBottom: '8px', borderRadius: '8px', border: 'solid 1px' }}
      />

      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
          {tagsArray.map(tag => (
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
              <button type="button" onClick={() => handleRemoveTag(tag)} style={{
                background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold',
                borderRadius: '8px'
              }}>
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
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            list="tags-list"
            style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }}
          />
          <datalist id="tags-list">
            {allTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button type="button" onClick={handleAddTag} style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить</button>
        </div>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label style={{ marginRight: '10px' }}>
          <input type="radio" value="note" checked={noteType === 'note'} onChange={() => setNoteType('note')} />
          Знание
        </label>
        <label>
          <input type="radio" value="task" checked={noteType === 'task'} onChange={() => setNoteType('task')} />
          Дело
        </label>
      </div>

      {noteType === 'task' && (
        <>
          {/* При входе */}
          <div style={{ marginBottom: '8px' }}>
            <strong>При входе:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
              {enterLocationTagIds.map(tagId => {
                const tag = locationTags.find(t => t.id === tagId);
                return tag ? (
                  <span key={tagId} style={{ background: '#859c5e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {tag.name}
                    <button type="button" onClick={() => setEnterLocationTagIds(prev => prev.filter(id => id !== tagId))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ) : null;
              })}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="text"
                placeholder="Добавить метку"
                value={enterInput}
                onChange={e => setEnterInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocationTag(enterInput, enterLocationTagIds, setEnterLocationTagIds, setEnterInput, 'enter'); } }}
                list="enter-tags-list"
                style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }}
              />
              <datalist id="enter-tags-list">
                {locationTags.map(tag => <option key={tag.id} value={tag.name} />)}
              </datalist>
              <button type="button" onClick={() => addLocationTag(enterInput, enterLocationTagIds, setEnterLocationTagIds, setEnterInput, 'enter')} style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить</button>
            </div>
          </div>

          {/* При выходе */}
          <div style={{ marginBottom: '8px' }}>
            <strong>При выходе:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
              {exitLocationTagIds.map(tagId => {
                const tag = locationTags.find(t => t.id === tagId);
                return tag ? (
                  <span key={tagId} style={{ background: '#859c5e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {tag.name}
                    <button type="button" onClick={() => setExitLocationTagIds(prev => prev.filter(id => id !== tagId))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ) : null;
              })}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input
                type="text"
                placeholder="Добавить метку"
                value={exitInput}
                onChange={e => setExitInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocationTag(exitInput, exitLocationTagIds, setExitLocationTagIds, setExitInput, 'exit'); } }}
                list="exit-tags-list"
                style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }}
              />
              <datalist id="exit-tags-list">
                {locationTags.map(tag => <option key={tag.id} value={tag.name} />)}
              </datalist>
              <button type="button" onClick={() => addLocationTag(exitInput, exitLocationTagIds, setExitLocationTagIds, setExitInput, 'exit')} style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить</button>
            </div>
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <button type="submit" style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить заметку</button>
      </div>
    </form>
  );
}

export default AddNoteForm;