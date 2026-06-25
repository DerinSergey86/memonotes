/* eslint-disable @next/next/no-img-element */
import { type LocationTag } from '@/types';

interface AddressCardProps {
  tag: LocationTag;
  isActive: boolean;
  onClick: (tagId: string) => void;
  onEdit: (tag: LocationTag) => void;
  taskCount: number;   // новое поле
}

export default function AddressCard({ tag, isActive, onClick, onEdit, taskCount }: AddressCardProps) {
  return (
    <div
      onClick={() => onClick(tag.id)}
      style={{
        border: `2px solid ${isActive ? '#859c5e' : '#ccc'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        width: '120px',
        flexShrink: 0,
        textAlign: 'center',
        boxShadow: isActive ? '0 0 8px rgba(133, 156, 94, 0.5)' : '0 2px 4px rgba(0,0,0,0.1)',
        position: 'relative',
        cursor: 'pointer',
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        transition: 'all 0.2s',
      }}
    >
      {/* Кнопка редактирования */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(tag);
        }}
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          background: 'rgba(255,255,255,0.8)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Редактировать адрес"
      >
        ✎
      </button>

      {/* Картинка или иконка */}
      {tag.image ? (
        <img src={tag.image} alt={tag.name} style={{ width: '100%', height: '80px', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '80px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
          📍
        </div>
      )}

      {/* Название */}
      <div style={{ padding: '4px', fontWeight: 'bold', fontSize: '14px', color: '#666' }}>
        {tag.name}
      </div>

      {/* Счётчик активных задач */}
      {taskCount > 0 && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          background: '#e74c3c',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
        }}>
          {taskCount}
        </div>
      )}
    </div>
  );
}