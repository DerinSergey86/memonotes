import { useMemo } from 'react';
import { type Note, type Group } from '@/types';

export function useAllTags(notes: Note[], groups: Group[]) {
  return useMemo(() => {
    const tagSet = new Set<string>();
    // из заметок
    notes.forEach(note => note.tags?.forEach(tag => tagSet.add(tag)));
    // из групп (основные и связанные теги)
    groups.forEach(group => {
      if (group.name) tagSet.add(group.name.toLowerCase());
      group.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [notes, groups]);
}