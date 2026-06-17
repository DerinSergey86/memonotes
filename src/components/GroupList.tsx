// src/components/GroupList.tsx
import { type Group } from '@/types';
import GroupCard from './GroupCard';
import { useDragScroll } from '@/hooks/useDragScroll';

interface GroupListProps {
  groups: Group[];
  activeTags: string[];
  onGroupClick: (group: Group) => void;
  onEditGroup: (group: Group) => void;
  onAddGroup: () => void;
}

export default function GroupList({ groups, activeTags, onGroupClick, onEditGroup, onAddGroup }: GroupListProps) {
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
      <div style={{ display: 'flex', alignItems: 'center' }}>
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
            flex: 1,
          }}
        >
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isActive={group.tags.some(tag => activeTags.includes(tag))}
              onClick={onGroupClick}
              onEdit={onEditGroup}
              isDragging={isDragging}
            />
          ))}
        </div>
        <button className="scroll-button" onClick={() => scroll('right')}>❯</button>
      </div>
      {/* Кнопка добавления группы */}
      <div style={{ textAlign: 'center', marginTop: '8px' }}>
        <button onClick={onAddGroup} style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: '#859c5e', color: 'white', border: 'none',
          cursor: 'pointer', fontSize: '18px',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
        }}>
          ＋
        </button>
      </div>
    </div>
  );
}