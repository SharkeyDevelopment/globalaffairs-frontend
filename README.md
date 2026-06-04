# GA Policy Hub — Frontend

The web interface for the GA Policy Hub demo — a tool that lets users upload regulatory documents and query them with AI-powered natural language search. Answers come back with source citations pointing to specific documents and pages.

## Features

- **Document Management** — Drag-and-drop upload with live processing status, tagging, and deletion
- **AI Q&A Chat** — Ask questions across all uploaded documents; responses include expandable source citations
- **Markdown Responses** — AI answers rendered with lists, emphasis, and structure
- **Data Grid** — Sortable, paginated document table with status badges and tag chips

## Architecture

```
┌───────────────────────────────────────────────┐
│                 React SPA                      │
│                                               │
│  Landing Page → App Shell (Sidebar + Pages)   │
│                                               │
│  ┌─────────────┐        ┌──────────────────┐  │
│  │  Documents   │        │   Ask Question    │  │
│  │  (Upload +   │        │   (Chat thread +  │  │
│  │   Grid)      │        │    citations)     │  │
│  └──────┬───────┘        └────────┬─────────┘  │
│         │                         │             │
│         └─────────┬───────────────┘             │
│                   │                             │
│          ┌────────▼────────┐                    │
│          │   API Client     │                    │
│          └────────┬────────┘                    │
└───────────────────┼─────────────────────────────┘
                    │ HTTP
           ┌────────▼────────┐
           │  FastAPI Backend │
           └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build | Vite 8 |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui |
| Data Grid | AG Grid |
| Markdown | react-markdown + remark-gfm |
| Icons | Lucide React |

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx                 # Auth gate + page routing
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind + theme
│   ├── types/index.ts          # Shared interfaces
│   ├── lib/
│   │   ├── api.ts             # Backend client (handles case conversion)
│   │   └── utils.ts           # Helpers
│   └── components/
│       ├── layout/            # AppShell, Sidebar
│       ├── pages/             # Documents, AskQuestion, LandingPage
│       ├── chat/              # Markdown renderer
│       └── ui/                # shadcn/ui primitives
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Expects the backend at `http://localhost:8080` (configurable via `VITE_API_URL` in `.env.local`).
