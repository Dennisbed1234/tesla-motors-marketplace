'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ACTIONS: { action: string; label: string }[] = [
  { action: 'CONFIRM_PAYMENT', label: 'Confirm payment' },
  { action: 'PREPARING', label: 'Preparing for transport' },
  { action: 'IN_TRANSIT', label: 'In transit' },
  { action: 'DELIVERED', label: 'Delivered' },
  { action: 'COLLECTED', label: 'Collected' },
  { action: 'CANCEL', label: 'Cancel' },
  { action: 'REFUND', label: 'Refund' },
];

export function AdminOrderActions({
  orderId,
  orderStatus,
  paymentStatus,
}: {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function run(action: string) {
    setLoading(action);
    setError('');
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {ACTIONS.map((a) => (
        <button
          key={a.action}
          type="button"
          disabled={loading !== null}
          onClick={() => run(a.action)}
          className="rounded-full border border-white/20 px-3 py-1 text-[11px] text-ink-200 hover:bg-white/10 disabled:opacity-50"
        >
          {loading === a.action ? '…' : a.label}
        </button>
      ))}
      <span className="w-full text-[10px] text-ink-500">
        Now: {orderStatus} / pay {paymentStatus}
      </span>
      {error && <span className="w-full text-xs text-red-400">{error}</span>}
    </div>
  );
}
