'use client'

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { type LocationTag } from '@/types';

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tags, setTags] = useState<LocationTag[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Загрузка меток
  const fetchTags = useCallback(async () => {
    const res = await fetch('/api/location-tags');
    if (res.ok) {
      const data = await res.json();
      setTags(data);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTags();
    } else if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, fetchTags, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) return;

    if (editingId) {
      // PUT
      await fetch('/api/location-tags', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name, address }),
      });
    } else {
      // POST
      await fetch('/api/location-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address }),
      });
    }

    setName('');
    setAddress('');
    setEditingId(null);
    fetchTags();
  };

  const handleEdit = (tag: LocationTag) => {
    setName(tag.name);
    setAddress(tag.address);
    setEditingId(tag.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Удалить метку?')) {
      await fetch('/api/location-tags', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchTags();
    }
  };

  if (status === 'loading') return <div>Загрузка...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Мои адреса</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Название (например, Работа)"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <input
          type="text"
          placeholder="Адрес"
          value={address}
          onChange={e => setAddress(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>
          {editingId ? 'Обновить' : 'Добавить'}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setName(''); setAddress(''); }} style={{ marginLeft: '8px', padding: '8px 16px' }}>
            Отмена
          </button>
        )}
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {tags.map(tag => (
          <li key={tag.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
            <strong>{tag.name}</strong> – {tag.address}
            <div style={{ marginTop: '8px' }}>
              <button onClick={() => handleEdit(tag)} style={{ marginRight: '8px' }}>Редактировать</button>
              <button onClick={() => handleDelete(tag.id)} style={{ color: 'red' }}>Удалить</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}