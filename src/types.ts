export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  type: 'note' | 'task';         // ← новое
  createdAt: string;
  updatedAt?: string;             // ← опционально
  dueDate?: string | null;        // ← опционально
  completed?: boolean;            // ← опционально
  latitude?: number | null;
  longitude?: number | null;
  location?: string | null;
  locationTagId?: string | null;
  locationTag?: LocationTag | null;
  notifyOnEnter?: boolean;
notifyOnExit?: boolean;
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
  latitude?: number | null;
  longitude?: number | null;
  radius?: number | null;
}