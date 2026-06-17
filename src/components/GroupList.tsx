import { type Group } from '@/types';
import GroupCard from './GroupCard';
import { useDragScroll } from '@/hooks/useDragScroll';

interface GroupListProps {
  groups: Group[];
  activeTags: string[];
  onGroupClick: (group: Group) => void;
  onEditGroup: (group: Group) => void;
}

export default function GroupList({ groups, activeTags, onGroupClick, onEditGroup }: GroupListProps) {
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
    <div style={{ minHeight: '140px' }}>
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
              isActive={
                group.id === 'no-tags'
                  ? activeTags.includes('__no_tags__')
                  : group.id === 'ungrouped'
                    ? false
                    : group.tags.some(tag => activeTags.includes(tag))
              }
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
}