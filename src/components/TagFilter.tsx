'use client';

import { useRef, useEffect } from 'react';

interface TagFilterProps {
  allTags: string[];
  activeTags: string[];
  onTagToggle: (tag: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  strictFilter: boolean;
  onStrictFilterToggle: () => void;
  focusedGroupTags: string[] | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TagFilter({
  allTags, activeTags, onTagToggle, searchQuery, onSearchChange,
  strictFilter, onStrictFilterToggle, focusedGroupTags, isOpen, onOpenChange
}: TagFilterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onOpenChange(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  const tagsToShow = focusedGroupTags ? focusedGroupTags : allTags;
  const filteredTags = tagsToShow.filter(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Поиск по тегам или заметкам..."
            value={searchQuery}
            onChange={e => { onSearchChange(e.target.value); if (!isOpen) onOpenChange(true); }}
            onFocus={() => { if (!isOpen) onOpenChange(true); }}
            style={{ width: '100%', padding: '8px 32px 8px 8px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box' }}
          />
          {searchQuery && (
            <button onClick={() => { onSearchChange(''); inputRef.current?.focus(); }} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#666' }}>
              ✕
            </button>
          )}
        </div>
        <div style={{ display: 'inline-flex', borderRadius: '20px', overflow: 'hidden', border: '1px solid #859c5e' }}>
          <button onClick={() => onStrictFilterToggle()} style={{ padding: '4px 12px', border: 'none', background: !strictFilter ? '#859c5e' : 'transparent', color: !strictFilter ? 'white' : '#859c5e', cursor: 'pointer', fontSize: '14px' }}>Включающие</button>
          <button onClick={() => onStrictFilterToggle()} style={{ padding: '4px 12px', border: 'none', background: strictFilter ? '#859c5e' : 'transparent', color: strictFilter ? 'white' : '#859c5e', cursor: 'pointer', fontSize: '14px' }}>Только</button>
        </div>
      </div>

      {activeTags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {activeTags.map(tag => (
            <span key={tag} style={{ background: '#859c5e', color: 'white', padding: '4px 8px', borderRadius: '16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {tag === '__no_tags__' ? 'Без тегов' : tag}
              <button onClick={() => onTagToggle(tag)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold', padding: '0 2px' }}>×</button>
            </span>
          ))}
          <button onClick={() => activeTags.forEach(t => onTagToggle(t))} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}>Сбросить всё</button>
        </div>
      )}

      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: '200px', overflowY: 'auto', background: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 100 }}>
          {filteredTags.length > 0 ? (
            filteredTags.map(tag => (
              <div key={tag} onClick={() => onTagToggle(tag)} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', fontSize: '14px', background: activeTags.includes(tag) ? '#f0f8ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {tag}
                {activeTags.includes(tag) && <span style={{ color: '#859c5e' }}>✓</span>}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', color: '#666', fontSize: '14px' }}>Нет совпадений</div>
          )}
        </div>
      )}
    </div>
  );
}