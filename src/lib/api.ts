import type { Document, ChatMessage, Source } from '../types';

function resolveApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
  // Production pages are HTTPS; Cloud Run only serves HTTPS — upgrade mistaken http:// API URLs.
  if (import.meta.env.PROD && raw.startsWith('http://') && !raw.includes('localhost')) {
    return raw.replace(/^http:\/\//, 'https://');
  }
  return raw;
}

const BASE_URL = resolveApiBaseUrl();

// Generic fetch — no Content-Type header (used for FormData uploads too)
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

// JSON-specific fetch (sets Content-Type: application/json)
async function jsonRequest<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
}

// --- API response shapes (snake_case from Python) ---

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

// --- Convert snake_case API responses to camelCase frontend types ---

function toDocument(d: ApiDocument): Document {
  return { id: d.id, name: d.name, status: d.status, tags: d.tags, uploadedAt: d.uploaded_at, pageCount: d.page_count };
}

function toSource(s: ApiSource): Source {
  return { docId: s.doc_id, docName: s.doc_name, pageNumber: s.page_number, excerpt: s.excerpt };
}

function toChatMessage(m: ApiChatMessage): ChatMessage {
  return { id: m.id, role: m.role, content: m.content, sources: m.sources.map(toSource) };
}

export interface QueryResult {
  answer: string;
  sources: Source[];
  sessionId: string;
}

export const api = {
  getDocuments: () =>
    jsonRequest<ApiDocument[]>('/api/documents/').then((docs) => docs.map(toDocument)),

  getDocument: (id: string) =>
    jsonRequest<ApiDocument>(`/api/documents/${id}`).then(toDocument),

  createDocument: (file: File, tags: string[] = []) => {
    const form = new FormData();
    form.append('file', file);
    form.append('tags', JSON.stringify(tags));
    return request<ApiDocument>('/api/documents/', { method: 'POST', body: form }).then(toDocument);
  },

  deleteDocument: (id: string) =>
    jsonRequest<void>(`/api/documents/${id}`, { method: 'DELETE' }),

  updateTags: (id: string, tags: string[]) =>
    jsonRequest<ApiDocument>(`/api/documents/${id}/tags`, {
      method: 'PATCH',
      body: JSON.stringify({ tags }),
    }).then(toDocument),

  query: (question: string, sessionId: string): Promise<QueryResult> =>
    jsonRequest<ApiQueryResponse>('/api/chat/query', {
      method: 'POST',
      body: JSON.stringify({ question, session_id: sessionId }),
    }).then((r) => ({ answer: r.answer, sources: r.sources.map(toSource), sessionId: r.session_id })),

  getSession: (sessionId: string) =>
    jsonRequest<ApiChatMessage[]>(`/api/chat/sessions/${sessionId}`).then((msgs) =>
      msgs.map(toChatMessage),
    ),

  clearSession: (sessionId: string) =>
    jsonRequest<void>(`/api/chat/sessions/${sessionId}`, { method: 'DELETE' }),
};
