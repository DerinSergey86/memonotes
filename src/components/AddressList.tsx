import { type LocationTag } from '@/types';
import { useDragScroll } from '@/hooks/useDragScroll';

interface AddressListProps {
  tags: LocationTag[];
  onEdit: (tag: LocationTag) => void;
}

export default function AddressList({ tags, onEdit }: AddressListProps) {
  const { ref, onMouseDown, onMouseLeave, onMouseUp, onMouseMove } = useDragScroll();

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
            flex: 1,
          }}
        >
          {tags.map(tag => (
            <div key={tag.id} style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '10px',
              width: '200px',
              flexShrink: 0,
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              position: 'relative',
            }}>
              {/* Кнопка редактирования — как в GroupCard */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(tag);
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
                title="Редактировать адрес"
              >
                ✎
              </button>

              <div style={{ fontWeight: 'bold', marginBottom: '5px', marginTop: '10px' }}>
                {tag.name}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {tag.address}
              </div>
              {tag.latitude && tag.longitude && (
                <div style={{ marginTop: '8px' }}>
                  <a
                    href={`https://yandex.ru/maps/?pt=${tag.longitude},${tag.latitude}&z=16&l=map`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '12px', color: '#859c5e', textDecoration: 'underline' }}
                  >
                    🗺️ Карта
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="scroll-button" onClick={() => scroll('right')}>❯</button>
      </div>
    </div>
  );
}