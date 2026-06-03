import { useState } from 'react';
import { type Note } from '@/types';



interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  onUpdate: (updatedNote: Note) => void;
  onTagClick: (tag: string) => void;
}

function NoteCard({ note, onDelete, onUpdate, onTagClick }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);
  const [editTags, setEditTags] = useState(note.tags.join(', ')); // массив в строку

  
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
    if (!editTitle.trim() || !editContent.trim() || !editTags.trim()) return;

    

  const updatedNote: Note = {
  ...note,
  title: editTitle.trim(),
  content: editContent.trim(),
  tags: editTags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
  type: note.type,  
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
        <div style={{ marginTop: '8px' }}>
          <button onClick={handleStartEditing} style={{ marginRight: '8px', padding: '4px 8px' }}>
            Редактировать
          </button>
          <button onClick={() => {
            if (window.confirm('Удалить заметку?')) onDelete(note.id);
          }} style={{ color: 'red', padding: '4px 8px' }}>
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
      <div>
        <button onClick={handleSave} style={{ marginRight: '8px', padding: '4px 12px' }}>
          Сохранить
        </button>
        <button onClick={handleCancel} style={{ padding: '4px 12px' }}>
          Отмена
        </button>
      </div>
    </div>
  );
}

export default NoteCard;