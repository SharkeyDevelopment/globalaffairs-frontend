import type { Document, ChatMessage } from '../types';

export const MOCK_DOCUMENTS: Document[] = [
  { id: '1', name: 'EU AI Act Summary Q1 2025.pdf', status: 'ready', tags: ['EMEA', 'AI Regulation'], uploadedAt: '2025-05-01', pageCount: 12 },
  { id: '2', name: 'APAC Data Localization Risk Brief.pdf', status: 'ready', tags: ['APAC', 'Data Privacy'], uploadedAt: '2025-05-03', pageCount: 8 },
  { id: '3', name: 'US Federal AI Policy Tracker.pdf', status: 'processing', tags: ['AMER'], uploadedAt: '2025-05-10', pageCount: 0 },
];

export const MOCK_CHAT_HISTORY: ChatMessage[] = [
  { id: '1', role: 'user', content: 'What are the main compliance obligations in the EU AI Act?' },
  {
    id: '2',
    role: 'assistant',
    content: 'The EU AI Act introduces tiered obligations based on risk level. High-risk AI systems must undergo conformity assessments and maintain technical documentation. Providers must also implement human oversight mechanisms and ensure data governance practices are in place.',
    sources: [
      { docId: '1', docName: 'EU AI Act Summary Q1 2025.pdf', pageNumber: 4, excerpt: 'High-risk AI systems shall be subject to conformity assessment procedures prior to market placement...' },
    ],
  },
];
