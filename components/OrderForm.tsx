'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/utils';

type Plan = 'FULL' | 'DEPOSIT_50' | 'DEPOSIT_25';

export function OrderForm({
  vehicleId,
  slug,
  currency,
  full,
  fifty,
  twentyFive,
}: {
  vehicleId: string;
  slug: string;
  currency: string;
  full: number;
  fifty: number;
  twentyFive: number;
}) {
  const [plan, setPlan] = useState<Plan>('DEPOSIT_25');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const amount =
    plan === 'FULL' ? full : plan === 'DEPOSIT_50' ? fifty : twentyFive;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId, paymentPlan: plan, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Order failed');
        return;
      }
      router.push(`/orders/${data.reference}/confirmed`);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  const options: { id: Plan; title: string; amount: number; hint: string }[] = [
    {
      id: 'DEPOSIT_25',
      title: '25% down payment',
      amount: twentyFive,
      hint: 'Mandatory minimum to secure the vehicle',
    },
    {
      id: 'DEPOSIT_50',
      title: '50% deposit',
      amount: fifty,
      hint: 'Half now, balance before delivery',
    },
    {
      id: 'FULL',
      title: 'Full payment',
      amount: full,
      hint: 'Pay the full vehicle price',
    },
  ];

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold">Payment option</h2>
      <div className="space-y-3">
        {options.map((o) => (
          <label
            key={o.id}
            className={`card flex cursor-pointer items-start gap-3 p-4 ${
              plan === o.id ? 'border-white/40 ring-1 ring-white/20' : ''
            }`}
          >
            <input
              type="radio"
              name="plan"
              className="mt-1"
              checked={plan === o.id}
              onChange={() => setPlan(o.id)}
            />
            <div className="flex-1">
              <p className="font-medium">{o.title}</p>
              <p className="text-xs text-ink-400">{o.hint}</p>
            </div>
            <p className="text-lg font-semibold">{formatMoney(o.amount, currency)}</p>
          </label>
        ))}
      </div>

      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea
          id="notes"
          className="input min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Preferred contact time, delivery notes…"
        />
      </div>

      <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-400">Due now</span>
          <span className="text-xl font-semibold">{formatMoney(amount, currency)}</span>
        </div>
        {plan !== 'FULL' && (
          <p className="mt-2 text-xs text-ink-500">
            Remaining balance of {formatMoney(full - amount, currency)} is due before delivery.
          </p>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Placing order…' : 'Confirm order'}
      </button>
      <p className="text-center text-xs text-ink-500">
        You must select at least the 25% down payment. Staff will confirm payment details after order placement.
      </p>
    </form>
  );
}
