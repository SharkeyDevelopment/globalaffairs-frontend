import { useState, useRef } from 'react';
import { Send, ChevronDown, Loader2, RotateCcw, Lightbulb, Globe, ShieldCheck, BarChart3, FileText, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChatMarkdown } from '@/components/chat/ChatMarkdown';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/types';

const SUGGESTION_PROMPTS = [
  {
    icon: Globe,
    label: 'Trade policy risks',
    prompt: 'What are the top trade policy risks in the Asia-Pacific region and their estimated financial impact?',
  },
  {
    icon: ShieldCheck,
    label: 'EU AI Act status',
    prompt: 'Summarize the current compliance status for the EU AI Act and any outstanding action items.',
  },
  {
    icon: BarChart3,
    label: 'Climate progress',
    prompt: 'What progress have we made toward our 2030 climate commitments, including Scope 1, 2, and 3 emissions?',
  },
  {
    icon: Landmark,
    label: 'US legislation tracker',
    prompt: 'Which US congressional bills have the highest Legislative Impact Model scores and what are our positions?',
  },
  {
    icon: Lightbulb,
    label: 'GenAI policy guardrails',
    prompt: 'What are the key principles and prohibited uses outlined in the GA Responsible Use Policy for GenAI?',
  },
  {
    icon: FileText,
    label: 'Geopolitical top risks',
    prompt: 'List the current top 5 geopolitical risks and their severity scores from the risk assessment framework.',
  },
] as const;

export function AskQuestion() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  async function handleSubmitWith(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const result = await api.query(trimmed, sessionIdRef.current);
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: result.answer,
        sources: result.sources,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Query failed:', err);
      const errorMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    handleSubmitWith(input);
  }

  async function handleNewSession() {
    try {
      await api.clearSession(sessionIdRef.current);
    } catch {
      // session may not exist on the server yet
    }
    sessionIdRef.current = crypto.randomUUID();
    setMessages([]);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ask a Question</h1>
          <p className="text-sm text-muted-foreground">
            Query across your uploaded policy documents
          </p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2" onClick={handleNewSession}>
            <RotateCcw className="h-3.5 w-3.5" />
            New Session
          </Button>
        )}
      </div>

      {/* Chat thread */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center gap-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                Global Affairs Intelligence Assistant
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask a question about your uploaded policy documents, or try a suggestion below.
              </p>
            </div>
            <div className="grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-2">
              {SUGGESTION_PROMPTS.map((s) => (
                <Button
                  key={s.label}
                  variant="outline"
                  className="h-auto justify-start gap-3 px-4 py-3 text-left whitespace-normal"
                  onClick={() => {
                    setInput(s.prompt);
                    handleSubmitWith(s.prompt);
                  }}
                >
                  <s.icon className="size-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight">{s.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-snug">
                      {s.prompt}
                    </p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-lg px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-card text-card-foreground'
              }`}
            >
              {msg.role === 'assistant' ? (
                <ChatMarkdown content={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <Collapsible className="mt-3">
                  <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium opacity-70 hover:opacity-100 transition-opacity">
                    <ChevronDown className="h-3 w-3" />
                    Sources ({msg.sources.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-2">
                    {msg.sources.map((source, idx) => (
                      <div
                        key={idx}
                        className="rounded border border-border bg-muted/50 p-2 text-xs"
                      >
                        <p className="font-medium text-foreground">
                          {source.docName}{' '}
                          <span className="font-normal text-muted-foreground">
                            — p. {source.pageNumber}
                          </span>
                        </p>
                        <p className="mt-1 text-muted-foreground italic">
                          "{source.excerpt}"
                        </p>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 border-t border-border pt-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your policy documents..."
          className="min-h-[40px] max-h-[120px] resize-none"
          rows={1}
        />
        <Button size="icon" onClick={handleSubmit} disabled={!input.trim() || loading}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
