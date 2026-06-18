'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import NoteCard from '@/components/NoteCard';
import AddNoteForm from '@/components/AddNoteForm';
import { useMounted } from '@/hooks/useMounted';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { type Note, type LocationTag, type Group } from '@/types';
import AddressList from '@/components/AddressList';
import AddressFormModal from '@/components/AddressFormModal';
import GroupList from '@/components/GroupList';
import EditGroupModal from '@/components/EditGroupModal';
import { useGeofencing } from '@/hooks/useGeofencing';
import TagFilter from '@/components/TagFilter';
import { useAllTags } from '@/hooks/useAllTags';

export default function App() {
  const mounted = useMounted();
  const router = useRouter();
  const { data: session } = useSession();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationTags, setLocationTags] = useState<LocationTag[]>([]);
  const [editingAddress, setEditingAddress] = useState<LocationTag | null | undefined>(undefined);
  const [geoEnabled, setGeoEnabled] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [strictFilter, setStrictFilter] = useState(false);
  const [noteTypeFilter, setNoteTypeFilter] = useState<'all' | 'note' | 'task'>('all');
  const [locationTagFilter, setLocationTagFilter] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingLocationList, setPendingLocationList] = useState<'enter' | 'exit' | null>(null);
  const [autoAddTag, setAutoAddTag] = useState<{ listType: 'enter' | 'exit'; tagId: string } | null>(null);
  const [focusedGroupId, setFocusedGroupId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);

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
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const allTags = useAllTags(notes, groups);
  const { startWatching, stopWatching } = useGeofencing({ locationTags, notes, enabled: geoEnabled });

  const noTagsGroup = useMemo<Group>(() => ({ id: 'no-tags', name: 'Без тегов', image: '/images/no-tags.png', tags: [] }), []);
  const ungroupedGroup = useMemo<Group>(() => {
    const grouped = new Set<string>();
    groups.forEach(g => g.tags.forEach(t => grouped.add(t.toLowerCase())));
    const ungrouped = allTags.filter(t => !grouped.has(t.toLowerCase()));
    return { id: 'ungrouped', name: 'Теги без группы', image: '/images/ungrouped.png', tags: ungrouped };
  }, [groups, allTags]);

  const allGroups = useMemo(() => [...groups, ungroupedGroup, noTagsGroup], [groups, ungroupedGroup, noTagsGroup]);

  const handleGroupClick = (group: Group) => {
    if (group.id === 'no-tags') {
      setActiveTags(['__no_tags__']);
      setStrictFilter(true);   // для "без тегов" оставляем строгий режим
      setFocusedGroupId(null);
      setFilterOpen(false);
      return;
    }
    if (group.id === 'ungrouped') {
      setActiveTags([]);
      setStrictFilter(false);
      setFocusedGroupId('ungrouped');
      setFilterOpen(true);
      return;
    }
    // Обычная группа – переключаем в нестрогий режим
    const mainTag = group.name.toLowerCase();
    if (activeTags.includes(mainTag)) {
      // Повторный клик – сброс
      setActiveTags([]);
      setStrictFilter(false);
      setFocusedGroupId(null);
    } else {
      setActiveTags([mainTag]);
      setStrictFilter(false);   // ← теперь НЕ строгий режим
      setFocusedGroupId(group.id);
    }
    setFilterOpen(false);
  };

  const handleEditGroup = (group: Group) => setEditingGroup(group);
  const handleAddGroup = () => {
    const newGroup: Group = { id: '', name: '', image: '/images/default.png', tags: [] };
    setEditingGroup(newGroup);
  };
  const handleSaveGroup = (updatedGroup: Group) => {
    if (updatedGroup.id) {
      setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
    } else {
      const newGroup = { ...updatedGroup, id: crypto.randomUUID() };
      setGroups(prev => [...prev, newGroup]);
    }
    setEditingGroup(null);
  };

  useEffect(() => {
    fetch('/api/notes')
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) router.push('/login');
          else setError('Не удалось загрузить заметки');
          setNotes([]);
          return;
        }
        return res.json();
      })
      .then(data => setNotes(data || []))
      .catch(() => setError('Не удалось загрузить заметки'))
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (session?.user) {
      fetch('/api/location-tags')
        .then(res => res.json())
        .then(data => setLocationTags(data || []))
        .catch(console.error);
    }
  }, [session]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    if (activeTags.includes('__no_tags__')) {
      result = result.filter(note => !note.tags || note.tags.length === 0);
    } else if (activeTags.length > 0) {
      result = result.filter(note => {
        if (strictFilter) {
          // Точное совпадение: заметка должна содержать ровно выбранные теги и никаких других
          return (
            note.tags?.length === activeTags.length &&
            activeTags.every(tag => note.tags?.includes(tag))
          );
        } else {
          // Нестрогий: хотя бы один из выбранных тегов присутствует
          return activeTags.some(tag => note.tags?.includes(tag));
        }
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(note =>
        note.title?.toLowerCase().includes(q) ||
        note.content?.toLowerCase().includes(q) ||
        note.tags?.some(t => t.includes(q))
      );
    }
    if (noteTypeFilter !== 'all') result = result.filter(note => note.type === noteTypeFilter);
    if (locationTagFilter) {
      result = result.filter(note =>
        note.enterLocationTagIds?.includes(locationTagFilter) ||
        note.exitLocationTagIds?.includes(locationTagFilter)
      );
    }
    return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, activeTags, strictFilter, searchQuery, noteTypeFilter, locationTagFilter]);

  const handleTagToggle = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleAddressClick = (id: string) => {
    setLocationTagFilter(prev => prev === id ? null : id);
  };

  const handleEditAddress = (tag: LocationTag) => setEditingAddress(tag);
  const handleAddAddress = () => setEditingAddress(null);

  const handleAddNote = async (newNote: Note) => {
    try {
      const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newNote) });
      if (!res.ok) throw new Error('Ошибка сервера');
      const saved = await res.json();
      setNotes(prev => [...prev, saved]);
    } catch { setError('Не удалось добавить заметку'); }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch('/api/notes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Ошибка удаления');
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch { setError('Не удалось удалить заметку'); }
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      const res = await fetch('/api/notes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedNote) });
      if (!res.ok) throw new Error('Ошибка обновления');
      const saved = await res.json();
      setNotes(prev => prev.map(n => n.id === saved.id ? saved : n));
    } catch { setError('Не удалось обновить заметку'); }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch('/api/location-tags', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      if (!res.ok) throw new Error('Ошибка удаления');
      setLocationTags(prev => prev.filter(t => t.id !== id));
    } catch { setError('Не удалось удалить адрес'); }
  };

  const handleRequestNewLocation = (listType: 'enter' | 'exit') => {
    setPendingLocationList(listType);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (data: { name: string; address?: string; radius: number; latitude: number | null; longitude: number | null; image?: string }) => {
    const url = '/api/location-tags';
    const method = editingAddress ? 'PUT' : 'POST';
    const body = editingAddress ? { id: editingAddress.id, ...data } : data;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Ошибка сохранения');
      const savedTag: LocationTag = await res.json();
      if (editingAddress) {
        setLocationTags(prev => prev.map(t => t.id === savedTag.id ? savedTag : t));
      } else {
        setLocationTags(prev => [...prev, savedTag]);
        if (pendingLocationList) {
          setAutoAddTag({ listType: pendingLocationList, tagId: savedTag.id });
        }
      }
      setEditingAddress(undefined);
      setPendingLocationList(null);
    } catch { setError('Не удалось сохранить адрес'); }
  };

  const handleAutoAddHandled = () => setAutoAddTag(null);

  const handleGeoClick = () => {
    if (!geoEnabled) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') { setGeoEnabled(true); startWatching(); }
        else alert('Разрешите уведомления, чтобы геозоны работали');
      });
    } else { setGeoEnabled(false); stopWatching(); }
  };

  const focusedGroupTags = useMemo(() => {
    if (focusedGroupId === 'ungrouped') return ungroupedGroup.tags;
    if (focusedGroupId) {
      const group = allGroups.find(g => g.id === focusedGroupId);
      return group ? group.tags.filter(t => t !== group.name.toLowerCase()) : null;
    }
    return null;
  }, [focusedGroupId, ungroupedGroup, allGroups]);

  const handleFilterOpenChange = useCallback((open: boolean) => {
    setFilterOpen(open);
    if (!open) setFocusedGroupId(null);
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Загрузка...</div>;
  if (error) return <div style={{ color: 'red', textAlign: 'center' }}>Ошибка: {error}</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', borderLeft: '1px solid #e0e0e0', borderRight: '1px solid #e0e0e0', minHeight: '100vh', padding: '0' }}>
      <div style={{ padding: '0 20px' }}>
        {/* Шапка */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', position: 'relative' }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '36px', lineHeight: '48px' }}>MemoNotes 📝</h1>
          </div>
          <div style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }}>
            {session ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span>{session.user?.email}</span><button onClick={() => signOut()} style={{ padding: '4px 8px', borderRadius: '8px', border: '1px solid #ccc' }}>Выйти</button></div>
            ) : <a href="/login" style={{ color: '#859c5e' }}>Войти</a>}
          </div>
        </div>

        {/* Фильтр */}
        <TagFilter
          allTags={allTags}
          activeTags={activeTags}
          onTagToggle={handleTagToggle}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          strictFilter={strictFilter}
          onStrictFilterToggle={() => setStrictFilter(!strictFilter)}
          focusedGroupTags={focusedGroupTags}
          isOpen={filterOpen}
          onOpenChange={handleFilterOpenChange}
        />

        {/* Переключатель Группы / Адреса + кнопка добавления + геозоны */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '10px', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', borderRadius: '20px', overflow: 'hidden', border: '1px solid #859c5e' }}>
            <button onClick={() => setShowAddresses(false)} style={{ padding: '4px 12px', border: 'none', background: !showAddresses ? '#859c5e' : 'transparent', color: !showAddresses ? 'white' : '#859c5e', cursor: 'pointer', fontSize: '14px' }}>🏷️ Группы</button>
            <button onClick={() => setShowAddresses(true)} style={{ padding: '4px 12px', border: 'none', background: showAddresses ? '#859c5e' : 'transparent', color: showAddresses ? 'white' : '#859c5e', cursor: 'pointer', fontSize: '14px' }}>🗺️ Адреса</button>
          </div>
          <button onClick={showAddresses ? handleAddAddress : handleAddGroup} style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#859c5e', color: 'white', border: 'none',
            cursor: 'pointer', fontSize: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            ＋
          </button>
          <button onClick={handleGeoClick} style={{ height: '28px', padding: '0 14px', borderRadius: '20px', border: '1px solid #859c5e', background: geoEnabled ? '#859c5e' : '#f0f0f0', color: geoEnabled ? 'white' : '#333', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center' }}>{geoEnabled ? '📍 Геозоны вкл' : '📍 Геозоны выкл'}</button>
        </div>

        {/* Карусель */}
        {mounted && !showAddresses && (
          <GroupList
            groups={allGroups}
            activeTags={activeTags}
            onGroupClick={handleGroupClick}
            onEditGroup={handleEditGroup}
          />
        )}
        {mounted && showAddresses && (
          <AddressList
            tags={locationTags}
            activeTagId={locationTagFilter}
            onAddressClick={handleAddressClick}
            onEdit={handleEditAddress}
          />
        )}

        {/* Знания/Дела */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px', gap: '10px' }}>
          <div style={{ display: 'inline-flex', borderRadius: '20px', border: '1px solid #859c5e', overflow: 'hidden' }}>
            <button onClick={() => setNoteTypeFilter(noteTypeFilter === 'note' ? 'all' : 'note')} style={{ padding: '4px 12px', border: 'none', background: noteTypeFilter === 'note' ? '#859c5e' : 'transparent', color: noteTypeFilter === 'note' ? 'white' : '#859c5e', cursor: 'pointer', fontSize: '14px' }}>📝 Знания</button>
            <button onClick={() => setNoteTypeFilter(noteTypeFilter === 'task' ? 'all' : 'task')} style={{ padding: '4px 12px', border: 'none', background: noteTypeFilter === 'task' ? '#859c5e' : 'transparent', color: noteTypeFilter === 'task' ? 'white' : '#859c5e', cursor: 'pointer', fontSize: '14px' }}>📌 Дела</button>
          </div>
        </div>

        <hr style={{ margin: '10px -20px', width: 'calc(100% + 40px)', border: 'none', borderTop: '1px solid #ccc' }} />

        {/* Форма */}
        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <button onClick={() => setIsFormOpen(!isFormOpen)} style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ccc' }}>{isFormOpen ? '▲ Свернуть' : '▼ Добавить заметку'}</button>
        </div>
        <div style={{ maxHeight: isFormOpen ? '1000px' : '0', overflow: 'hidden', transition: 'all 0.3s', opacity: isFormOpen ? 1 : 0 }}>
          <AddNoteForm onAdd={handleAddNote} allTags={allTags} locationTags={locationTags} onRequestNewLocation={handleRequestNewLocation} autoAddTag={autoAddTag} onAutoAddHandled={handleAutoAddHandled} />
        </div>

        <hr style={{ margin: '10px -20px', width: 'calc(100% + 40px)', border: 'none', borderTop: '1px solid #ccc' }} />

        {/* Заметки */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {filteredNotes.map(note => (
            <NoteCard key={note.id} 
            note={note} 
            onDelete={handleDeleteNote} 
            onUpdate={handleUpdateNote} 
            onTagClick={handleTagToggle} 
            locationTags={locationTags}
            allTags={allTags} />
          ))}
        </div>

        {editingAddress !== undefined && (
          <AddressFormModal initial={editingAddress} onSave={handleSaveAddress} onClose={() => setEditingAddress(undefined)} onDelete={handleDeleteAddress} />
        )}
        {editingGroup && (
          <EditGroupModal 
          group={editingGroup} 
          onSave={handleSaveGroup} 
          onClose={() => setEditingGroup(null)} 
          allTags={allTags} />
        )}
      </div>
    </div>
  );
}