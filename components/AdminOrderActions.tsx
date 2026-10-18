'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ORDER_ACTIONS: { action: string; label: string }[] = [
  { action: 'CONFIRM_PAYMENT', label: 'Confirm payment' },
  { action: 'CANCEL', label: 'Cancel' },
  { action: 'REFUND', label: 'Refund' },
];

const SHIP_ACTIONS: { action: string; label: string }[] = [
  { action: 'SHIP_LABEL', label: '1. Label created' },
  { action: 'SHIP_PICKED_UP', label: '2. Picked up' },
  { action: 'SHIP_IN_TRANSIT', label: '3. In transit' },
  { action: 'SHIP_OUT_FOR_DELIVERY', label: '4. Out for delivery' },
  { action: 'SHIP_DELIVERED', label: '5. Delivered' },
];

export function AdminOrderActions({
  orderId,
  orderStatus,
  paymentStatus,
  carrierTracking,
  cancelledByCustomer,
}: {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  carrierTracking?: string | null;
  cancelledByCustomer?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function run(action: string) {
    if (action === 'DELETE_PERMANENT') {
      const ok = window.confirm(
        'Permanently delete this order from the database? This cannot be undone.'
      );
      if (!ok) return;
    }

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
    <div className="mt-3 space-y-3">
      {cancelledByCustomer && (
        <p className="rounded-lg bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
          Customer requested delete/cancel. You can permanently remove this order below.
        </p>
      )}

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          Payment & order
        </p>
        <div className="flex flex-wrap gap-2">
          {ORDER_ACTIONS.map((a) => (
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
          <button
            type="button"
            disabled={loading !== null}
            onClick={() => run('DELETE_PERMANENT')}
            className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-[11px] text-red-200 hover:bg-red-500/20 disabled:opacity-50"
          >
            {loading === 'DELETE_PERMANENT' ? '…' : 'Delete permanently'}
          </button>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-ink-500">
          Shipment steps (customer tracking)
        </p>
        <div className="flex flex-wrap gap-2">
          {SHIP_ACTIONS.map((a) => (
            <button
              key={a.action}
              type="button"
              disabled={loading !== null}
              onClick={() => run(a.action)}
              className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/20 disabled:opacity-50"
            >
              {loading === a.action ? '…' : a.label}
            </button>
          ))}
        </div>
        {carrierTracking && (
          <p className="mt-2 font-mono text-[11px] text-emerald-300">Track #: {carrierTracking}</p>
        )}
      </div>

      <p className="text-[10px] text-ink-500">
        Now: {orderStatus} / pay {paymentStatus}
      </p>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
