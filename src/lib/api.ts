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

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string, path: string) {
    super(`API error ${status}: ${path}`);
    this.status = status;
    this.detail = detail;
  }

  get isRateLimited() {
    return this.status === 429;
  }
}

// Generic fetch — no Content-Type header (used for FormData uploads too)
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    let detail = `Request failed`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch { /* ignore parse errors */ }
    throw new ApiError(res.status, detail, path);
  }
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

export interface Usage {
  date: string;
  aiRequests: number;
  aiLimit: number;
  uploads: number;
  uploadLimit: number;
  deletes: number;
  deleteLimit: number;
}

interface ApiUsage {
  date: string;
  ai_requests: number;
  ai_limit: number;
  uploads: number;
  upload_limit: number;
  deletes: number;
  delete_limit: number;
}

function toUsage(u: ApiUsage): Usage {
  return {
    date: u.date,
    aiRequests: u.ai_requests,
    aiLimit: u.ai_limit,
    uploads: u.uploads,
    uploadLimit: u.upload_limit,
    deletes: u.deletes,
    deleteLimit: u.delete_limit,
  };
}

export const api = {
  getUsage: () => jsonRequest<ApiUsage>('/api/usage').then(toUsage),

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
