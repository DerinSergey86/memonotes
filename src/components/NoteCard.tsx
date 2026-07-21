/* eslint-disable @next/next/no-img-element */
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    setEditTitle(note.title);
    // Извлекаем первое data:image и убираем его из текста
    const regex = /data:image\/[^;]+;base64,[^\s]+/g;
    const imgs = note.content.match(regex);
    if (imgs && imgs.length > 0) {
      setImagePreview(imgs[0]);
      setEditContent(note.content.replace(imgs[0], '').trim());
    } else {
      setImagePreview(null);
      setEditContent(note.content);
    }
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

  const handleSave = () => {
    if (!editTitle.trim() && !editContent.trim() && !imagePreview) return;

    let finalContent = editContent.trim();
    if (imagePreview) {
      finalContent = finalContent ? `${finalContent}\n${imagePreview}` : imagePreview;
    }

    const updatedNote: Note = {
      ...note,
      title: editTitle.trim() || finalContent.slice(0, 50),
      content: finalContent,
      tags: editTags,
      type: note.type,
      enterLocationTagIds: editEnterLocationTagIds,
      exitLocationTagIds: editExitLocationTagIds,
    };

    onUpdate(updatedNote);
    setIsEditing(false);
  };

  const renderContent = (text: string) => {
    // Разбиваем текст по data:image URL-ам (захватываем до пробела или конца строки)
    const regex = /(data:image\/[^;]+;base64,[^\s]+)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.match(regex)) {
        return <img key={i} src={part} alt="photo" style={{ maxWidth: '100%', borderRadius: '8px', margin: '8px 0' }} />;
      }
      return <span key={i}>{part}</span>;
    });
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
        <div>{renderContent(note.content)}</div>
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
          <button onClick={handleStartEditing} className="btn" style={{ marginRight: '8px', border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
            Редактировать
          </button>
          <button onClick={() => {
            if (window.confirm('Удалить заметку?')) onDelete(note.id);
          }} className="btn" style={{ border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
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
        className="form-input"
        style={{ width: '100%', marginBottom: '8px', fontWeight: 'bold' }}
        placeholder="Заголовок"
      />
      {/* Поле ввода с иконкой камеры */}
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          rows={4}
          className="form-input"
          style={{ width: '100%', paddingRight: '40px' }}
          placeholder="Содержание"
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
            className="form-input"
            style={{ flex: 1, borderRadius: '8px' }}
          />
          <datalist id="edit-tags-list">
            {allTags.map(tag => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
          <button type="button" onClick={handleAddEditTag} className="btn" style={{ border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
            Добавить
          </button>
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
              <input type="text" placeholder="Добавить метку" value={enterInput} onChange={e => setEnterInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocationTag(enterInput, editEnterLocationTagIds, setEditEnterLocationTagIds, setEnterInput); } }} list="edit-enter-tags-list" className="form-input" style={{ flex: 1, borderRadius: '8px' }} />
              <datalist id="edit-enter-tags-list">
                {locationTags.map(tag => <option key={tag.id} value={tag.name} />)}
              </datalist>
              <button type="button" onClick={() => addLocationTag(enterInput, editEnterLocationTagIds, setEditEnterLocationTagIds, setEnterInput)} className="btn" style={{ border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
                Добавить
              </button>
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
              <input type="text" placeholder="Добавить метку" value={exitInput} onChange={e => setExitInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocationTag(exitInput, editExitLocationTagIds, setEditExitLocationTagIds, setExitInput); } }} list="edit-exit-tags-list" className="form-input" style={{ flex: 1, borderRadius: '8px' }} />
              <datalist id="edit-exit-tags-list">
                {locationTags.map(tag => <option key={tag.id} value={tag.name} />)}
              </datalist>
              <button type="button" onClick={() => addLocationTag(exitInput, editExitLocationTagIds, setEditExitLocationTagIds, setExitInput)} className="btn" style={{ border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
                Добавить
              </button>
            </div>
          </div>
        </>
      )}

      <div>
        <button onClick={handleSave} className="btn" style={{ marginRight: '8px', border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
          Сохранить
        </button>
        <button onClick={handleCancel} className="btn" style={{ border: '1px solid #ccc', background: '#f0f0f0', color: '#333' }}>
          Отмена
        </button>
      </div>
    </div>
  );
}

export default NoteCard;