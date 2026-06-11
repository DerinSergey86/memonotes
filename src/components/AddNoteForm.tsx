import { useState } from 'react';
import { type Note, type LocationTag } from '@/types';

interface AddNoteFormProps {
  onAdd: (note: Note) => void;
  allTags: string[];
  locationTags: LocationTag[];  
}

function AddNoteForm({ onAdd, allTags, locationTags }: AddNoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [inputTag, setInputTag] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'task'>('note');
  const [selectedLocationTagId, setSelectedLocationTagId] = useState<string>('');
  const [notifyOnEnter, setNotifyOnEnter] = useState(true);
  const [notifyOnExit, setNotifyOnExit] = useState(true);


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
    if (!content.trim()) return;

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.trim() || content.trim().slice(0, 50),
      content: content.trim(),
      tags: tagsArray,
      type: noteType,              
      createdAt: new Date().toISOString(),
      locationTagId: noteType === 'task' ? selectedLocationTagId || null : null,
    notifyOnEnter: notifyOnEnter,
  notifyOnExit: notifyOnExit,
    };

   onAdd(newNote);
    setTitle('');
    setContent('');
    setTagsArray([]);
    setNoteType('note');               
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
                style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', borderRadius: '8px' }}
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
            style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }}
          />
          <datalist id="tags-list">
            {allTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button type="button" onClick={handleAddTag } style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить</button>
        </div>
      </div>
      <div style={{ marginBottom: '8px' }}>
        <label style={{ marginRight: '10px' }}>
          <input
            type="radio"
            value="note"
            checked={noteType === 'note'}
            onChange={() => setNoteType('note')}
          />
          Знание
        </label>
        <label>
          <input
            type="radio"
            value="task"
            checked={noteType === 'task'}
            onChange={() => setNoteType('task')}
          />
          Дело
        </label>
      </div>
      {noteType === 'task' && (
        <>
  <div style={{ marginBottom: '8px' }}>
    <select
      value={selectedLocationTagId}
      onChange={(e) => setSelectedLocationTagId(e.target.value)}
      style={{ width: '100%', padding: '6px' }}
    >
      <option value="">Без геометки</option>
      {locationTags.map(tag => (
        <option key={tag.id} value={tag.id}>
          {tag.name} — {tag.address}
        </option>
      ))}
    </select>
  </div>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <input type="checkbox" checked={notifyOnEnter} onChange={e => setNotifyOnEnter(e.target.checked)} />
      Уведомить при входе
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <input type="checkbox" checked={notifyOnExit} onChange={e => setNotifyOnExit(e.target.checked)} />
      Уведомить при выходе
    </label>
  </>
)}

<div style={{ textAlign: 'center', marginTop: '8px' }}>
      <button type="submit" style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить заметку</button>
    </div>
    </form>
  );
}

export default AddNoteForm;