export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  type: 'note' | 'task';
  createdAt: string;
  updatedAt?: string;
  dueDate?: string | null;
  completed?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  enterLocationTagIds?: string[];
  exitLocationTagIds?: string[];
}

export interface Group {
  id: string;
  name: string;
  image: string;
  tags: string[];
}

export interface LocationTag {
  id: string;
  name: string;
  address: string;
  image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}