import { type LocationTag } from '@/types';

interface AddressListProps {
  tags: LocationTag[];
  onEdit: (tag: LocationTag) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export default function AddressList({ tags, onEdit, onDelete, onAdd }: AddressListProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
        
        <h2 style={{ margin: 0 }}>Адреса</h2>
        <button onClick={onAdd} style={{
          background: '#859c5e',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  marginLeft: '15px',
  lineHeight: 1,
  color: 'white',
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
        }}>
          ＋
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
        {tags.map(tag => (
          <div key={tag.id} style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
            width: '200px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            position: 'relative',
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{tag.name}</div>
            <div style={{ fontSize: '14px', color: '#666' }}>{tag.address}</div>
            {tag.latitude && tag.longitude && (
      <a
        href={`https://yandex.ru/maps/?pt=${tag.longitude},${tag.latitude}&z=16&l=map`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ marginLeft: '8px', display: 'inline-block' }}
      >
        🗺️ Показать на карте
      </a>
    )}
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button onClick={() => onEdit(tag)} style={{ padding: '4px 8px', border: 'solid 1px', borderRadius: '4px' }}>✎</button>
              <button onClick={() => { if (window.confirm('Удалить адрес?')) onDelete(tag.id); }} style={{ padding: '4px 8px', color: 'red', borderRadius: '4px', border: 'solid 1px black' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}