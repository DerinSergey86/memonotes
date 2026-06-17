import { type LocationTag } from '@/types';

interface AddressCardProps {
  tag: LocationTag;
  isActive: boolean;
  onClick: (tagId: string) => void;
  onEdit: (tag: LocationTag) => void;
}

export default function AddressCard({ tag, isActive, onClick, onEdit }: AddressCardProps) {
  return (
    <div onClick={() => onClick(tag.id)} style={{
      border: `2px solid ${isActive ? '#859c5e' : '#ccc'}`, borderRadius: '8px', overflow: 'hidden', width: '120px',
      flexShrink: 0, textAlign: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'relative', cursor: 'pointer',
      transform: isActive ? 'scale(1.05)' : 'scale(1)'
    }}>
      <button onClick={(e) => { e.stopPropagation(); onEdit(tag); }} style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        ✎
      </button>
      <div style={{ width: '100%', height: '80px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📍</div>
      <div style={{ padding: '4px', fontWeight: 'bold', fontSize: '14px', color: '#666' }}>{tag.name}</div>
    </div>
  );
}