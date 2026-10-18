'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatMoney } from '@/lib/utils';

type Step = {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
  at: string | null;
};

type TrackResult = {
  reference: string;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  vehicle: { model: string; trim: string; modelYear: number; slug: string };
  currency: string;
  sellingPrice: string;
  steps: Step[];
  message: string;
};

export function OrderTracker({ initialReference }: { initialReference?: string }) {
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('order') || searchParams.get('reference') || '';
  const [reference, setReference] = useState(initialReference || fromUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);

  async function lookup(refRaw: string) {
    const ref = refRaw.trim().toUpperCase();
    if (!ref) {
      setError('Enter your order number');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/orders/track?reference=${encodeURIComponent(ref)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Order not found');
        return;
      }
      setResult(data);
      setReference(ref);
    } catch {
      setError('Network error — try again');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const seed = (initialReference || fromUrl || '').trim();
    if (seed) {
      void lookup(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReference, fromUrl]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void lookup(reference);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <p className="text-sm font-semibold text-white">Track your order</p>
        <p className="mt-1 text-xs text-ink-400">
          Enter your order number (ORD-…). Follow every step from placement through worldwide delivery.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
        <div>
          <label htmlFor="order-ref" className="label">
            Order number
          </label>
          <input
            id="order-ref"
            className="input font-mono tracking-wide uppercase"
            placeholder="ORD-XXXXXXXX"
            value={reference}
            onChange={(e) => {
              setReference(e.target.value);
              setError('');
            }}
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading}>
          {loading ? 'Looking up…' : 'Track order'}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {result && (
        <div className="border-t border-white/10 px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-500">Order</p>
              <p className="mt-1 font-mono text-lg font-semibold text-white">{result.reference}</p>
              <p className="mt-1 text-sm text-ink-300">
                {result.vehicle.modelYear} {result.vehicle.model} · {result.vehicle.trim}
              </p>
              <p className="mt-1 text-xs text-ink-500">
                Placed {new Date(result.createdAt).toLocaleDateString()} ·{' '}
                {formatMoney(result.sellingPrice, result.currency)}
              </p>
            </div>
            <Link
              href={`/vehicles/${result.vehicle.slug}`}
              className="text-xs text-ink-300 underline hover:text-white"
            >
              View vehicle
            </Link>
          </div>

          <p className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
            Worldwide delivery — tracked from start to finish with your order number.
          </p>

          <ol className="mt-6 space-y-0">
            {result.steps.map((step, i) => (
              <li key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                {i < result.steps.length - 1 && (
                  <span
                    className={`absolute left-[11px] top-6 h-[calc(100%-1.25rem)] w-0.5 ${
                      step.done ? 'bg-emerald-500/60' : 'bg-white/10'
                    }`}
                    aria-hidden
                  />
                )}
                <span
                  className={`relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    step.done
                      ? 'bg-emerald-500 text-ink-950'
                      : step.current
                        ? 'bg-white text-ink-950 ring-2 ring-white/30'
                        : 'bg-white/10 text-ink-400'
                  }`}
                >
                  {step.done ? '✓' : i + 1}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p
                    className={`text-sm font-medium ${
                      step.current || step.done ? 'text-white' : 'text-ink-500'
                    }`}
                  >
                    {step.label}
                    {step.current && !step.done && (
                      <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-amber-300">
                        Current
                      </span>
                    )}
                  </p>
                  {step.at && (
                    <p className="mt-0.5 text-xs text-ink-500">
                      {new Date(step.at).toLocaleString()}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
