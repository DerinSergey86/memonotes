import { useState } from 'react';
import { type Note, type LocationTag } from '@/types';



interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (updatedNote: Note) => void;
  onTagClick: (tag: string) => void;
  locationTags: LocationTag[];
}

function NoteCard({ note, onDelete, onUpdate, onTagClick, locationTags }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState(note.tags.join(', '));
const [editLocationTagId, setEditLocationTagId] = useState(note.locationTagId || '');
const [editNotifyOnEnter, setEditNotifyOnEnter] = useState(note.notifyOnEnter ?? true);
const [editNotifyOnExit, setEditNotifyOnExit] = useState(note.notifyOnExit ?? true);


  
  // Вход в режим редактирования: сбрасываем поля на текущие значения заметки
  const handleStartEditing = () => {
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
    setIsEditing(true);
  };

  // Отмена: просто выходим из режима редактирования
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Сохранение: собираем новый объект заметки и передаём наверх
  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim() || !editTags.trim() || !editNotifyOnEnter || !editNotifyOnExit) return;

    

  const updatedNote: Note = {
  ...note,
  title: editTitle.trim(),
  content: editContent.trim(),
  tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
  notifyOnEnter: editNotifyOnEnter,
  notifyOnExit: editNotifyOnExit,
  type: note.type,  
  locationTagId: note.type === 'task' ? editLocationTagId || null : null,
};

    onUpdate(updatedNote);
    setIsEditing(false);
  };

  // -- Рендер в режиме просмотра --
  if (!isEditing) {
    return (
      <div style={{ border: '1px solid #ccc',
       borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
         transition: 'transform 0.2s',
          padding: '10px',
           margin: '10px auto',
           width: '100%',
            maxWidth: '1160px',
           textAlign: 'center' }}>
        <h3 style={{ margin: '1em 0' }}>{note.title}</h3>
        <p>{note.content}</p>
        <div>
          {note.tags.map((tag) => (
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
{note.type === 'task' && locationTags && (
  <div style={{ fontSize: '14px', color: '#666' }}>
    {(() => {
      const tag = locationTags.find(lt => lt.id === note.locationTagId);
      return tag ? `📍 ${tag.name}` : null;
    })()}
  </div>
)}
        <div style={{ marginTop: '8px' }}>
          <button onClick={handleStartEditing} 
          style={{ marginRight: '8px', padding: '4px 8px', borderRadius: '8px', border: 'solid 1px' 
            
          }}>
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

  // -- Рендер в режиме редактирования --
  return (
    <div style={{ border: '1px solid #007bff',
     padding: '10px',
      margin: '10px auto',
      width: '100%',
      maxWidth: '1160px',
       background: '#f0f8ff',
       boxSizing: 'border-box',
       textAlign: 'center' }}>
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
      <input
        type="text"
        value={editTags}
        onChange={(e) => setEditTags(e.target.value)}
        style={{ width: '100%', marginBottom: '8px' }}
        placeholder="Теги через запятую"
      />
      {note.type === 'task' && (
  <div style={{ marginBottom: '8px' }}>
    <select
      value={editLocationTagId}
      onChange={(e) => setEditLocationTagId(e.target.value)}
      style={{ width: '100%', padding: '6px' }}
    >
      <option value="">Без геометки</option>
      {locationTags.map(tag => (
        <option key={tag.id} value={tag.id}>
          {tag.name} — {tag.address}
        </option>
      ))}
    </select>
    <>
    <div style={{ textAlign: 'left', marginBottom: '8px' }}>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <input type="checkbox" checked={editNotifyOnEnter} onChange={e => setEditNotifyOnEnter(e.target.checked)} />
      Уведомить при входе
    </label>
    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input type="checkbox" checked={editNotifyOnExit} onChange={e => setEditNotifyOnExit(e.target.checked)} />
      Уведомить при выходе
    </label>
  </div>
  </>
  </div>
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