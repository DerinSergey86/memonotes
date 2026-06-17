// src/types.ts
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
  name: string;         // основной тег (название группы)
  image: string;        // картинка мема
  tags: string[];       // связанные теги (основной дублируется первым элементом для удобства, но можно просто включать основной)
}

export interface LocationTag {
  id: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}