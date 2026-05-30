import { useState } from 'react';
import { type Group } from '../types';

interface EditGroupModalProps {
  group: Group;
  onSave: (updatedGroup: Group) => void;
  onClose: () => void;
}

function EditGroupModal({ group, onSave, onClose }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [tagsString, setTagsString] = useState(group.tags.join(', '));
  const [imagePreview, setImagePreview] = useState<string>(group.image);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем, что это изображение
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    // Читаем файл как data URL
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setError('');
    };
    reader.onerror = () => {
      setError('Не удалось прочитать файл');
    };
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
      image: imagePreview,
      tags: tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== ''),
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
        <h3>Редактирование группы</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '12px' }}>
            <label>Название:</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Теги (через запятую):</label>
            <input
              type="text"
              value={tagsString}
              onChange={e => setTagsString(e.target.value)}
              style={{ width: '100%', marginTop: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label>Картинка:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <img
                src={imagePreview}
                alt="Превью"
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }}
              />
              <label style={{ 
  padding: '6px 14px', 
  cursor: 'pointer', 
  background: '#f0f0f0', 
  border: '1px solid #ccc', 
  borderRadius: '4px',
  fontSize: '14px'
}}>
  Выберите файл
  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    style={{ display: 'none' }}
  />
</label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px',  }}>
            <button type="button" onClick={onClose} style={{ padding: '4px 8px' }}>Отмена</button>
            <button type="submit" style={{ padding: '4px 8px' }}>Сохранить</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditGroupModal;