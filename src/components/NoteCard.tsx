import { useState } from 'react';
import { type Note, type LocationTag } from '@/types';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (updatedNote: Note) => void;
  onTagClick: (tag: string) => void;
  locationTags: LocationTag[];
  allTags: string[];
}

function NoteCard({ note, onDelete, onUpdate, onTagClick, locationTags, allTags }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState<string[]>(note.tags || []);
  const [editInputTag, setEditInputTag] = useState('');
  const [editEnterLocationTagIds, setEditEnterLocationTagIds] = useState<string[]>(note.enterLocationTagIds || []);
  const [editExitLocationTagIds, setEditExitLocationTagIds] = useState<string[]>(note.exitLocationTagIds || []);
  const [enterInput, setEnterInput] = useState('');
  const [exitInput, setExitInput] = useState('');

  const handleStartEditing = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags || []);
    setEditEnterLocationTagIds(note.enterLocationTagIds || []);
    setEditExitLocationTagIds(note.exitLocationTagIds || []);
    setEditInputTag('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleAddEditTag = () => {
    const trimmed = editInputTag.trim().toLowerCase();
    if (trimmed && !editTags.includes(trimmed)) {
      setEditTags(prev => [...prev, trimmed]);
    }
    setEditInputTag('');
  };

  const handleRemoveEditTag = (tag: string) => {
    setEditTags(prev => prev.filter(t => t !== tag));
  };

  const addLocationTag = (
    input: string,
    currentIds: string[],
    setIds: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const found = locationTags.find(tag => tag.name.toLowerCase() === trimmed.toLowerCase());
    if (found && !currentIds.includes(found.id)) {
      setIds(prev => [...prev, found.id]);
    }
    setInput('');
  };

  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim()) return;

    const updatedNote: Note = {
      ...note,
      title: editTitle.trim(),
      content: editContent.trim(),
      tags: editTags,
      type: note.type,
      enterLocationTagIds: editEnterLocationTagIds,
      exitLocationTagIds: editExitLocationTagIds,
    };

    onUpdate(updatedNote);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div style={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        padding: '10px',
        margin: '10px auto',
        width: '100%',
        maxWidth: '1160px',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '1em 0' }}>{note.title}</h3>
        <p>{note.content}</p>
        <div>
          {note.tags?.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              style={{
                background: '#859c5e',
                marginRight: '5px',
                padding: '2px 6px',
                borderRadius: '4px',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'inherit'
              }}
            >
              {tag}
            </button>
          ))}
        </div>
        <small>Создано: {new Date(note.createdAt).toLocaleString()}</small>
        <div style={{ marginBottom: '8px' }}>
          {note.type === 'task' ? '📌 Дело' : '📝 Знание'}
        </div>

        {note.type === 'task' && (
          <>
            {note.enterLocationTagIds && note.enterLocationTagIds.length > 0 && (
              <div style={{ fontSize: '14px', color: '#666' }}>
                <strong>При входе:</strong>
                {note.enterLocationTagIds.map(tagId => {
                  const tag = locationTags.find(lt => lt.id === tagId);
                  return tag ? <div key={tagId}>📍 {tag.name}</div> : null;
                })}
              </div>
            )}
            {note.exitLocationTagIds && note.exitLocationTagIds.length > 0 && (
              <div style={{ fontSize: '14px', color: '#666' }}>
                <strong>При выходе:</strong>
                {note.exitLocationTagIds.map(tagId => {
                  const tag = locationTags.find(lt => lt.id === tagId);
                  return tag ? <div key={tagId}>🚪 {tag.name}</div> : null;
                })}
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '8px' }}>
          <button onClick={handleStartEditing} style={{ marginRight: '8px', padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>
            Редактировать
          </button>
          <button onClick={() => {
            if (window.confirm('Удалить заметку?')) onDelete(note.id);
          }} style={{ color: 'red', padding: '4px 8px', borderRadius: '8px', border: 'solid 1px black' }}>
            Удалить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #007bff',
      padding: '10px',
      margin: '10px auto',
      width: '100%',
      maxWidth: '1160px',
      background: '#f0f8ff',
      boxSizing: 'border-box',
      textAlign: 'center'
    }}>
      <input
        type="text"
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '8px', fontWeight: 'bold' }}
        placeholder="Заголовок"
      />
      <textarea
        value={editContent}
        onChange={(e) => setEditContent(e.target.value)}
        rows={4}
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Содержание"
      />

      {/* Редактирование тегов */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '4px' }}>
          {editTags.map(tag => (
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
                onClick={() => handleRemoveEditTag(tag)}
                style={{
                  background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold',
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
            value={editInputTag}
            onChange={(e) => setEditInputTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddEditTag(); } }}
            list="edit-tags-list"
            style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }}
          />
          <datalist id="edit-tags-list">
            {allTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button type="button" onClick={handleAddEditTag} style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить</button>
        </div>
      </div>

      {/* Геометки (только для задач) */}
      {note.type === 'task' && (
        <>
          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <strong>При входе:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
              {editEnterLocationTagIds.map(tagId => {
                const tag = locationTags.find(t => t.id === tagId);
                return tag ? (
                  <span key={tagId} style={{ background: '#859c5e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {tag.name}
                    <button type="button" onClick={() => setEditEnterLocationTagIds(prev => prev.filter(id => id !== tagId))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ) : null;
              })}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input type="text" placeholder="Добавить метку" value={enterInput} onChange={e => setEnterInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocationTag(enterInput, editEnterLocationTagIds, setEditEnterLocationTagIds, setEnterInput); } }} list="edit-enter-tags-list" style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }} />
              <datalist id="edit-enter-tags-list">
                {locationTags.map(tag => <option key={tag.id} value={tag.name} />)}
              </datalist>
              <button type="button" onClick={() => addLocationTag(enterInput, editEnterLocationTagIds, setEditEnterLocationTagIds, setEnterInput)} style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить</button>
            </div>
          </div>

          <div style={{ marginBottom: '8px', textAlign: 'left' }}>
            <strong>При выходе:</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
              {editExitLocationTagIds.map(tagId => {
                const tag = locationTags.find(t => t.id === tagId);
                return tag ? (
                  <span key={tagId} style={{ background: '#859c5e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    {tag.name}
                    <button type="button" onClick={() => setEditExitLocationTagIds(prev => prev.filter(id => id !== tagId))} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                  </span>
                ) : null;
              })}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <input type="text" placeholder="Добавить метку" value={exitInput} onChange={e => setExitInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocationTag(exitInput, editExitLocationTagIds, setEditExitLocationTagIds, setExitInput); } }} list="edit-exit-tags-list" style={{ flex: 1, borderRadius: '8px', border: 'solid 1px' }} />
              <datalist id="edit-exit-tags-list">
                {locationTags.map(tag => <option key={tag.id} value={tag.name} />)}
              </datalist>
              <button type="button" onClick={() => addLocationTag(exitInput, editExitLocationTagIds, setEditExitLocationTagIds, setExitInput)} style={{ padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' }}>Добавить</button>
            </div>
          </div>
        </>
      )}

      <div>
        <button onClick={handleSave} style={{ marginRight: '8px', padding: '4px 12px', borderRadius: '8px', border: 'solid 1px' }}>
          Сохранить
        </button>
        <button onClick={handleCancel} style={{ padding: '4px 12px', borderRadius: '8px', border: 'solid 1px' }}>
          Отмена
        </button>
      </div>
    </div>
  );
}

export default NoteCard;