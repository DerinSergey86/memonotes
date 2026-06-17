'use client';
import { type LocationTag } from '@/types';
import AddressCard from './AddressCard';
import { useDragScroll } from '@/hooks/useDragScroll';

interface AddressListProps {
  tags: LocationTag[];
  activeTagId: string | null;
  onAddressClick: (tagId: string) => void;
  onEdit: (tag: LocationTag) => void;
}

export default function AddressList({ tags, activeTagId, onAddressClick, onEdit }: AddressListProps) {
  const { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove } = useDragScroll();

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '120px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button className="scroll-button" onClick={() => scroll('left')}>❮</button>
        <div
          ref={ref}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
          style={{ display: 'flex', gap: '10px', overflowX: 'auto', padding: '10px 0', cursor: 'grab', userSelect: 'none', flex: 1 }}
        >
          {tags.map(tag => (
            <AddressCard key={tag.id} tag={tag} isActive={activeTagId === tag.id} onClick={onAddressClick} onEdit={onEdit} />
          ))}
        </div>
        <button className="scroll-button" onClick={() => scroll('right')}>❯</button>
      </div>
    </div>
  );
}