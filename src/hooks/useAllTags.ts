import { useMemo } from 'react';
import { type Note } from '@/types';

export function useAllTags(notes: Note[]) {
  return useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags?.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);
}