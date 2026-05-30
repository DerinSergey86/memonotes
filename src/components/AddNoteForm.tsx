import { useState } from 'react';
import { type Note } from '../types';

interface AddNoteFormProps {
  onAdd: (note: Note) => void;
  allTags: string[];
}

function AddNoteForm({ onAdd, allTags }: AddNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');

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

 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || tagsArray.length === 0) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.trim(),
      content: content.trim(),
      tags: tagsArray, // уже в нижнем регистре
      createdAt: new Date().toISOString(),
    };

    onAdd(newNote);
    setTitle('');
    setContent('');
    setTagsArray([]);
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    setTagsArray([]);
    setInputTag('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <input type="submit" style={{ display: 'none' }} />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button type="button" onClick={handleClear} style={{ padding: '4px 8px' }}>
          Очистить
        </button>
        <input
          type="text"
          placeholder="Заголовок заметки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>
      <textarea
        placeholder="Текст заметки или ссылка"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        style={{ width: '100%', marginBottom: '8px' }}
      />
      
      {/* Блок тегов */}
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
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
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
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
            list="tags-list"
            style={{ flex: 1 }}
          />
          <datalist id="tags-list">
            {allTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button type="button" onClick={handleAddTag } style={{ padding: '4px 8px' }}>Добавить</button>
        </div>
      </div>
<div style={{ textAlign: 'center', marginTop: '8px' }}>
      <button type="submit" style={{ padding: '4px 8px' }}>Добавить заметку</button>
    </div>
    </form>
  );
}

export default AddNoteForm;