import { type Group } from '@/types';
import GroupCard from './GroupCard';
import { useDragScroll } from '@/hooks/useDragScroll';

interface GroupListProps {
  groups: Group[];
  onGroupClick: (group: Group) => void;
  onEditGroup: (group: Group) => void;
}

function GroupList({ groups, onGroupClick, onEditGroup }: GroupListProps) {
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
    <a href="/addresses" style={{
      textDecoration: 'none',
      background: '#859c5e',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      marginLeft: '15px',
      whiteSpace: 'nowrap',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}>
      Мои адреса
    </a>
  </div>
  <div className="group-container" style={{ display: 'flex', alignItems: 'center' }}>
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
            flex: 1,
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
    </div>
  )};

export default GroupList;