import { type Group } from '@/types';
import GroupCard from './GroupCard';
import { useDragScroll } from '@/hooks/useDragScroll';

interface GroupListProps {
  groups: Group[];
  onGroupClick: (group: Group) => void;
  onEditGroup: (group: Group) => void;
  onAddGroup: () => void;
  onShowAddresses: () => void;
}

function GroupList({ groups, onGroupClick, onEditGroup, onAddGroup, onShowAddresses }: GroupListProps) {
  const { ref, isDragging, onMouseDown, onMouseLeave, onMouseUp, onMouseMove } = useDragScroll();

  const scroll = (direction: 'left' | 'right') => {
    if (!ref.current) return;
    const scrollAmount = 300;
    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

    return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Группы</h2>
        <button onClick={onAddGroup} style={{
          background: 'transparent',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          marginLeft: '15px',
          lineHeight: 1,
        }}>
          ＋
        </button>
        <button onClick={onShowAddresses} style={{
          textDecoration: 'none',
          background: '#f0f0f0',
          color: '#333',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '14px',
          marginLeft: '15px',
          whiteSpace: 'nowrap',
          border: '1px solid #ccc',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
          boxShadow: 'none',
          transition: 'background 0.2s',
        }}>
          🗺️ Мои адреса
        </button>
      </div>

      {/* Основной контейнер для карусели */}
      <div className="group-container" style={{ display: 'flex', alignItems: 'center' }}>
        <button className="scroll-button" onClick={() => scroll('left')}>❮</button>
        <div
          ref={ref}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          style={{
            display: 'flex',
            gap: '10px',
            overflowX: 'auto',
            padding: '10px 0',
            cursor: 'grab',
            userSelect: 'none',
            flex: 1,  // ← вот это ограничивает ширину и включает скролл
          }}
        >
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onClick={onGroupClick}
              onEdit={onEditGroup}
              isDragging={isDragging}
            />
          ))}
        </div>
        <button className="scroll-button" onClick={() => scroll('right')}>❯</button>
      </div>
    </div>
  );
};
export default GroupList;