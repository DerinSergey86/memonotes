'use client'

import { useState, useEffect, useMemo } from 'react';
import GroupList from '@/components/GroupList';
import NoteCard from '@/components/NoteCard';
import { type Group, type Note } from '@/types';
import AddNoteForm from '@/components/AddNoteForm';
import EditGroupModal from '@/components/EditGroupModal';
import { useMounted } from '@/hooks/useMounted';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';



function App() {
  const mounted = useMounted();

  const [groups, setGroups] = useState<Group[]>([
    { id: '1', name: 'Семья', image: '/images/family.png', tags: ['семья'] },
    { id: '2', name: 'Работа', image: '/images/work.png', tags: ['работа'] },
    { id: '3', name: 'Учёба', image: '/images/study.png', tags: ['учёба'] },
    { id: '4', name: 'Спорт', image: '/images/sport.png', tags: ['спорт'] },
    { id: '5', name: 'Покупки', image: '/images/shopping.png', tags: ['покупки'] },
    { id: '6', name: 'Книги', image: '/images/books.png', tags: ['книги'] },
    { id: '7', name: 'Музыка', image: '/images/music.png', tags: ['музыка'] },
    { id: '8', name: 'Дача', image: '/images/dacha.png', tags: ['дача'] },
    { id: '9', name: 'Машина', image: '/images/car.png', tags: ['машина'] },
    { id: '10', name: 'Рецепты', image: '/images/recipes.png', tags: ['рецепты'] },
  ]);
  
const [notes, setNotes] = useState<Note[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const router = useRouter();
const { data: session } = useSession();

useEffect(() => {
  fetch('/api/notes')
    .then(res => {
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
        } else {
          setError('Не удалось загрузить заметки');
        }
        setNotes([]);
        return;
      }
      return res.json();
    })
    .then(data => setNotes(data || []))
    .catch(() => setError('Не удалось загрузить заметки'))
    .finally(() => setLoading(false));
}, [router]);


const [searchQuery, setSearchQuery] = useState('');
const [isSearchOpen, setIsSearchOpen] = useState(false);


const allTags = useMemo(() => {
  const tagSet = new Set<string>();
  notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
  groups.forEach(group => group.tags.forEach(tag => tagSet.add(tag)));
  return Array.from(tagSet).sort(); // отсортированы по алфавиту
}, [notes, groups]);

  const handleGroupClick = (group: Group) => {
  setActiveTags(prevTags => {
    const newTags = group.tags.filter(tag => !prevTags.includes(tag));
    return [...prevTags, ...newTags];
  });
};

const [editingGroup, setEditingGroup] = useState<Group | null>(null);

const handleEditGroup = (group: Group) => {
  setEditingGroup(group);
};

const handleSaveGroup = (updatedGroup: Group) => {
  setGroups(prevGroups =>
    prevGroups.map(g => g.id === updatedGroup.id ? updatedGroup : g)
  );
  setEditingGroup(null);
};

const handleCloseModal = () => {
  setEditingGroup(null);
};

  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAddNote = async (newNote: Note) => {
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote),
    });
    if (!res.ok) throw new Error('Ошибка сервера');
    const savedNote = await res.json();
    setNotes(prev => [...prev, savedNote]);
  } catch {
    setError('Не удалось добавить заметку');
  }
};

const handleDeleteNote = async (id: string) => {
  try {
    const res = await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) throw new Error('Ошибка сервера');
    setNotes(prev => prev.filter(note => note.id !== id));
  } catch {
    setError('Не удалось удалить заметку');
  }
};

const handleUpdateNote = async (updatedNote: Note) => {
  try {
    const res = await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedNote),
    });
    if (!res.ok) throw new Error('Ошибка сервера');
    const savedNote = await res.json();
    setNotes(prev =>
      prev.map(note => note.id === savedNote.id ? savedNote : note)
    );
  } catch {
    setError('Не удалось обновить заметку');
  }
};

const [activeTags, setActiveTags] = useState<string[]>([]);

const [strictFilter, setStrictFilter] = useState(false)

const filteredNotes = (() => {
  let result = activeTags.length === 0
    ? notes
    : notes.filter(note =>
        strictFilter
          ? activeTags.every(tag => note.tags.includes(tag))
          : activeTags.some(tag => note.tags.includes(tag))
      );

  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    result = result.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.includes(query))
    );
  }

  return result;
})();

const handleTagClick = (tag: string) => {
  setActiveTags(prevTags =>
    prevTags.includes(tag)
      ? prevTags.filter(t => t !== tag)   // удаляем, если уже есть
      : [...prevTags, tag]                // добавляем, если нет
  );
};

const sortedNotes = [...filteredNotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка...</div>;
if (error) return <div style={{ color: 'red', textAlign: 'center' }}>Ошибка: {error}</div>;

  return (
    <div style={{ maxWidth: '1200px',
     margin: '0 auto',
     borderLeft: '1px solid #e0e0e0',
    borderRight: '1px solid #e0e0e0',
    minHeight: '100vh',
    boxSizing: 'border-box',
      padding: '0' }}>
        <div style={{ padding: '0 20px' }}>
          {/* Шапка с заголовком и кнопкой */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '10px',
            position: 'relative'
          }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{
                margin: 0,
                fontSize: '36px',
                lineHeight: '48px',
                padding: '0',
                whiteSpace: 'nowrap'
              }}>
                MemoNotes 📝
              </h1>
            </div>
            <div style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              {session ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{session.user?.email}</span>
                  <button onClick={() => signOut()} style={{
  textDecoration: 'none',
  background: '#ccc',
  color: '#333',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '14px',
  whiteSpace: 'nowrap',
  border: 'none',
  cursor: 'pointer',
}}>
  Выйти
</button>
                </div>
              ) : (
                <a href="/login" style={{
                  textDecoration: 'none',
                  background: '#859c5e',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  whiteSpace: 'nowrap',
                }}>
                  Войти
                </a>
              )}
            </div>
          </div>
      {activeTags.length > 0 && (
  <div style={{ margin: '10px 0', padding: '8px', background: '#f0f0f0', borderRadius: '4px',textAlign: 'center', display: 'flex', justifyContent: 'center', flexWrap: 'wrap'  }}>
    <strong>Фильтр:</strong>
    {activeTags.map(tag => (
      <span key={tag} style={{
        display: 'inline-block',
        background: '#859c5e',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        margin: '2px 4px',
        fontSize: '14px'
      }}>
        {tag}
        <button
          onClick={() => handleTagClick(tag)}  // повторный клик удалит тег
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: '4px',
            fontWeight: 'bold'
          }}
        >
          ✕
        </button>
      </span>
    ))}
    <button
  onClick={() => setStrictFilter(prev => !prev)}
  style={{
    marginLeft: '10px',
    padding: '2px 8px',
    background: strictFilter ? '#859c5e' : '#e0e0e0',
    color: strictFilter ? 'white' : '#333',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  }}
  title={strictFilter ? 'поиск по конкретным тегам' : 'все упомянутые теги во всех группах'}
>
  {strictFilter ? 'только' : 'все'}
</button>
    <button onClick={() => setActiveTags([])} style={{ marginLeft: '10px' }}>
      Сбросить всё
    </button>
  </div>
)}
<hr style={{ marginLeft: '-20px', marginRight: '-20px', width: 'calc(100% + 40px)', border: 'none', borderTop: '1px solid #ccc' }} />
{mounted && (
      <GroupList groups={groups} onGroupClick={handleGroupClick} onEditGroup={handleEditGroup}/> 
      )} 
      <div style={{ textAlign: 'center', margin: '10px 0',  }}>
      <button onClick={() => setIsFormOpen(prev => !prev)} style={{ padding: '6px 12px' }}>
        {isFormOpen ? '▲ Свернуть форму' : '▼ Добавить заметку'}
      </button>
    </div>
<div style={{
  maxHeight: isFormOpen ? '1000px' : '0',
  overflow: 'hidden',
  transition: 'max-height 0.3s ease, opacity 0.3s ease',
  opacity: isFormOpen ? 1 : 0,
}}>
  <AddNoteForm onAdd={handleAddNote} allTags={allTags} />
</div>
      <hr style={{ marginLeft: '-20px', marginRight: '-20px', width: 'calc(100% + 40px)', border: 'none', borderTop: '1px solid #ccc' }} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
  <h2 style={{ margin: 0 }}>Заметки</h2>
  {!isSearchOpen ? (
    <button
      onClick={() => setIsSearchOpen(true)}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        padding: '4px',
        borderRadius: '50%',
      }}
      title="Поиск"
    >
      🔍
    </button>
  ) : (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      animation: 'fadeIn 0.2s ease',
    }}>
      <input
        type="text"
        placeholder="Поиск по заметкам..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        autoFocus
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          width: '200px',
        }}
      />
      <button
        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        ✕
      </button>
    </div>
  )}
</div>
   <div style={{ display: 'flex',
     flexDirection: 'column',
      alignItems: 'center' }}>
      {sortedNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onDelete={handleDeleteNote}
          onUpdate={handleUpdateNote}
          onTagClick={handleTagClick}
        />
      ))}
    </div>

    {editingGroup && (
      <EditGroupModal
        group={editingGroup}
        onSave={handleSaveGroup}
        onClose={handleCloseModal}
      />
    )}
    </div>
  </div>
);
}
export default App