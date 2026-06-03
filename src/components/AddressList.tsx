import { type LocationTag } from '@/types';

interface AddressListProps {
  tags: LocationTag[];
  onEdit: (tag: LocationTag) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onBack: () => void;
}

export default function AddressList({ tags, onEdit, onDelete, onAdd, onBack }: AddressListProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
        <button onClick={onBack} style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          marginRight: '15px',
        }}>
          ← Назад
        </button>
        <h2 style={{ margin: 0 }}>Мои адреса</h2>
        <button onClick={onAdd} style={{
          background: 'transparent',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          marginLeft: '15px',
          lineHeight: 1,
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
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button onClick={() => onEdit(tag)} style={{ padding: '4px 8px' }}>✎</button>
              <button onClick={() => { if (window.confirm('Удалить адрес?')) onDelete(tag.id); }} style={{ padding: '4px 8px', color: 'red' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}