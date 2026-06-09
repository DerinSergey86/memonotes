/* eslint-disable @next/next/no-img-element */
import { type Group } from '@/types';

interface GroupCardProps {
  group: Group;
  onClick: (group: Group) => void;
  onEdit: (group: Group) => void;
  isDragging: boolean;
  isActive: boolean;
}

function GroupCard({ group, onClick, onEdit, isDragging, isActive }: GroupCardProps) {
  const handleClick = () => {
    if (!isDragging) {
      onClick(group);
    }
  };

 return (
    <div
      onClick={handleClick}
      style={{
        cursor: 'pointer',
        border: `2px solid ${isActive ? '#859c5e' : '#ccc'}`,
        borderRadius: '8px',
        overflow: 'hidden',
        width: '120px',
        flexShrink: 0,
        textAlign: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, border-color 0.2s',
        position: 'relative',
        transform: isActive ? 'scale(1.08)' : 'scale(1)',  // начальный масштаб
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {/* Кнопка редактирования */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit(group);
        }}
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          background: 'rgba(255,255,255,0.4)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        title="Редактировать группу"
      >
        ✎
      </button>


      <img
        src={group.image}
        alt={group.name}
        style={{ width: '100%', height: '80px', objectFit: 'cover' }}
      />
      <div style={{ padding: '4px', fontWeight: 'bold', fontSize: '14px', color: '#666' }}>
        {group.name}
      </div>
    </div>
  );
}

export default GroupCard;