'use client';

import { FormEvent, useEffect, useState } from 'react';

type Msg = { id: string; body: string; isAdmin: boolean; createdAt: string };

const GUEST_KEY = 'tm_chat_thread_guest';

export default function ChatPage() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Only restore guest threads; never show another user's history after logout
    let cancelled = false;
    async function init() {
      try {
        const me = await fetch('/api/auth/me').then((r) => r.json()).catch(() => null);
        if (cancelled) return;
        if (me?.user) {
          // Logged-in: start clean unless we have a thread for this session only
          const key = `tm_chat_thread_${me.user.id}`;
          const saved = localStorage.getItem(key);
          if (saved) setThreadId(saved);
          else {
            localStorage.removeItem(GUEST_KEY);
            setThreadId(null);
            setMessages([]);
          }
          if (me.user.fullName) setName(me.user.fullName);
          if (me.user.email) setEmail(me.user.email);
        } else {
          // Guest: only guest key
          const saved = localStorage.getItem(GUEST_KEY);
          if (saved) setThreadId(saved);
          else {
            setThreadId(null);
            setMessages([]);
          }
        }
      } catch {
        const saved = localStorage.getItem(GUEST_KEY);
        if (saved) setThreadId(saved);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!threadId || !ready) return;
    let cancelled = false;
    async function load() {
      const res = await fetch(`/api/chat?threadId=${threadId}`);
      if (res.status === 403 || res.status === 404) {
        localStorage.removeItem(GUEST_KEY);
        setThreadId(null);
        setMessages([]);
        return;
      }
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
  }, [threadId, ready]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = threadId ? { threadId, body: text } : { name, email, body: text };
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
        const me = await fetch('/api/auth/me').then((r) => r.json()).catch(() => null);
        if (me?.user?.id) {
          localStorage.setItem(`tm_chat_thread_${me.user.id}`, data.threadId);
          localStorage.removeItem(GUEST_KEY);
        } else {
          localStorage.setItem(GUEST_KEY, data.threadId);
        }
      }
      setText('');
      const tid = data.threadId || threadId;
      if (tid) {
        const r = await fetch(`/api/chat?threadId=${tid}`);
        const d = await r.json();
        if (d.thread?.messages) setMessages(d.thread.messages);
      }
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    setThreadId(null);
    setMessages([]);
    setText('');
    localStorage.removeItem(GUEST_KEY);
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-ink-400">Loading chat…</div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Live chat</h1>
          <p className="mt-2 text-sm text-ink-400">Message our team. We reply within minutes.</p>
        </div>
        {threadId && (
          <button type="button" onClick={startNewChat} className="text-xs text-ink-400 underline">
            New chat
          </button>
        )}
      </div>

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
