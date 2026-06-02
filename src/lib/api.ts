import type { Document, ChatMessage, Source } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

// The API returns snake_case keys; the React types use camelCase.
// These helpers convert between the two shapes.

interface ApiDocument {
  id: string;
  name: string;
  status: 'processing' | 'ready' | 'error';
  tags: string[];
  uploaded_at: string;
  page_count: number;
}

interface ApiSource {
  doc_id: string;
  doc_name: string;
  page_number: number;
  excerpt: string;
}

interface ApiChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: ApiSource[];
}

interface ApiQueryResponse {
  answer: string;
  sources: ApiSource[];
  session_id: string;
}

function toDocument(d: ApiDocument): Document {
  return {
    id: d.id,
    name: d.name,
    status: d.status,
    tags: d.tags,
    uploadedAt: d.uploaded_at,
    pageCount: d.page_count,
  };
}

function toSource(s: ApiSource): Source {
  return {
    docId: s.doc_id,
    docName: s.doc_name,
    pageNumber: s.page_number,
    excerpt: s.excerpt,
  };
}

function toChatMessage(m: ApiChatMessage): ChatMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    sources: m.sources.map(toSource),
  };
}

export interface QueryResult {
  answer: string;
  sources: Source[];
  sessionId: string;
}

export const api = {
  // Documents
  getDocuments: () =>
    request<ApiDocument[]>('/api/documents').then((docs) => docs.map(toDocument)),

  getDocument: (id: string) =>
    request<ApiDocument>(`/api/documents/${id}`).then(toDocument),

  createDocument: (body: { name: string; tags: string[] }) =>
    request<ApiDocument>('/api/documents', {
      method: 'POST',
      body: JSON.stringify(body),
    }).then(toDocument),

  deleteDocument: (id: string) =>
    request<void>(`/api/documents/${id}`, { method: 'DELETE' }),

  updateTags: (id: string, tags: string[]) =>
    request<ApiDocument>(`/api/documents/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tags }),
    }).then(toDocument),

  // Chat
  query: (question: string, sessionId: string): Promise<QueryResult> =>
    request<ApiQueryResponse>('/api/chat/query', {
      method: 'POST',
      body: JSON.stringify({ question, session_id: sessionId }),
    }).then((r) => ({
      answer: r.answer,
      sources: r.sources.map(toSource),
      sessionId: r.session_id,
    })),

  getSession: (sessionId: string) =>
    request<ApiChatMessage[]>(`/api/chat/sessions/${sessionId}`).then((msgs) =>
      msgs.map(toChatMessage),
    ),

  clearSession: (sessionId: string) =>
    request<void>(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' }),
};
