import { type Group } from '@/types';
import GroupCard from './GroupCard';
import { useDragScroll } from '@/hooks/useDragScroll';

interface GroupListProps {
  groups: Group[];
  onGroupClick: (group: Group) => void;
  onEditGroup: (group: Group) => void;
  onAddGroup: () => void;
  activeTags: string[];
}

function GroupList({ groups, onGroupClick, onEditGroup, activeTags }: GroupListProps) {
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
              isActive={activeTags.some(tag => group.tags.includes(tag))}
            />
          ))}
        </div>
        <button className="scroll-button" onClick={() => scroll('right')}>❯</button>
      </div>
    </div>
  );
};
export default GroupList;