import { useState, useRef } from 'react';
import { Send, ChevronDown, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { api } from '@/lib/api';
import type { ChatMessage } from '@/types';

export function AskQuestion() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionIdRef = useRef(crypto.randomUUID());

  async function handleSubmit() {
    const trimmed = input.trim();
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
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Ask a question to get started</p>
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
              <p className="whitespace-pre-wrap">{msg.content}</p>
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
