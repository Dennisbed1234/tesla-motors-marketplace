'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export function AdminChatReply({ threadId }: { threadId: string }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, body }),
    });
    setBody('');
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2 border-t border-white/10 p-4">
      <input
        className="input flex-1"
        placeholder="Reply as support…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <button type="submit" disabled={loading} className="btn-primary !px-5">
        {loading ? '…' : 'Send'}
      </button>
    </form>
  );
}
