export interface User {
  name: string;
  email: string;
}

export interface Document {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  tags: string[];
  uploadedAt: string;
  pageCount: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
}

export interface Source {
  docId: string;
  docName: string;
  pageNumber: number;
  excerpt: string;
}
