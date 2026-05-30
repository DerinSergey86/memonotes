export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];       // массив строк, например ["работа", "важное"]
  createdAt: string;    // дата в формате ISO, например "2026-05-14T12:00:00Z"
}

export interface Group {
  id: string;
  name: string;        
  image: string;       
  tags: string[];      
}