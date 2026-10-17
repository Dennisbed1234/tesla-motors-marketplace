'use client';

import { FormEvent, useEffect, useState } from 'react';

type Msg = { id: string; body: string; isAdmin: boolean; createdAt: string };

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('tm_chat_thread') : null;
    if (saved) setThreadId(saved);
  }, []);

  useEffect(() => {
    if (!threadId) return;
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/chat?threadId=${threadId}`);
      const data = await res.json();
      if (!cancelled && data.thread?.messages) {
        setMessages(data.thread.messages);
      }
    }
    load();
    const t = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [threadId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = threadId
        ? { threadId, body: text }
        : { name, email, body: text };
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send');
        return;
      }
      if (data.threadId) {
        setThreadId(data.threadId);
        localStorage.setItem('tm_chat_thread', data.threadId);
      }
      setText('');
      if (data.threadId) {
        const r = await fetch(`/api/chat?threadId=${data.threadId}`);
        const d = await r.json();
        if (d.thread?.messages) setMessages(d.thread.messages);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Live chat</h1>
      <p className="mt-2 text-sm text-ink-400">Message our team. We reply within minutes.</p>

      <div className="card mt-6 flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ minHeight: 280 }}>
          {messages.length === 0 && (
            <p className="text-center text-sm text-ink-500">Start a conversation below.</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.isAdmin ? 'ml-auto bg-accent text-white' : 'bg-ink-800 text-ink-100'
              }`}
            >
              <p className="text-[10px] opacity-70">{m.isAdmin ? 'Support' : 'You'}</p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-2 border-t border-white/10 p-4">
          {!threadId && (
            <>
              <input
                className="input"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          )}
          <textarea
            className="input min-h-[80px]"
            placeholder="Type your message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Sending…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
