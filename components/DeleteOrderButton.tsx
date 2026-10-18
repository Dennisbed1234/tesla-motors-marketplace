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

  async function onDelete() {
    if (disabled) return;
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
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not delete order');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  if (disabled) {
    return (
      <span className="text-[11px] text-ink-600">Cannot delete delivered orders</span>
    );
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
      {error && <span className="text-[10px] text-red-400">{error}</span>}
    </div>
  );
}
