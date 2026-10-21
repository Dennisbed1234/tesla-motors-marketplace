'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function DeleteOrderButton({
  reference,
  disabled,
}: {
  reference: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function onDelete() {
    if (disabled || loading || done) return;
    const ok = window.confirm(
      `Remove order ${reference}? Our team will be notified. This cannot be undone from your account.`
    );
    if (!ok) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reference: String(reference || '').trim() }),
      });
      let data: { error?: string; message?: string; ok?: boolean } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        setError(data.error || `Could not delete order (${res.status})`);
        return;
      }
      setDone(true);
      router.refresh();
      // Ensure list updates even if soft-nav stalls
      setTimeout(() => router.refresh(), 300);
    } catch {
      setError('Network error — check your connection and try again');
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return <span className="text-[11px] text-ink-600">Cannot delete delivered orders</span>;
  }

  if (done) {
    return <span className="text-[11px] text-ink-500">Order removed</span>;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="text-[11px] text-red-400 underline hover:text-red-300 disabled:opacity-50"
      >
        {loading ? 'Removing…' : 'Delete order'}
      </button>
      {error && <span className="max-w-[180px] text-right text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
