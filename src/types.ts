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
}

export interface Group {
  id: string;
  name: string;        
  image: string;       
  tags: string[];      
}