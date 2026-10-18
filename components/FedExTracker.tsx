'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

type Step = {
  key: string;
  label: string;
  done: boolean;
  current: boolean;
  detail: string;
  location?: string | null;
  at: string | null;
};

type TrackResult = {
  trackingNumber: string;
  status: string;
  orderReference: string;
  orderStatus: string;
  vehicle: { model: string; trim: string; modelYear: number; slug: string };
  deliveryAddress?: string | null;
  steps: Step[];
  message: string;
};

export function FedExTracker() {
  const [tracking, setTracking] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackResult | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const code = tracking.replace(/\s+/g, '').trim();
    if (!code) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/shipping/track?number=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Tracking not found');
        return;
      }
      setResult(data);
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950">
      <div className="border-b border-white/10 bg-white px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/fedex-logo.svg"
            alt="FedEx"
            width={160}
            height={40}
            className="h-10 w-auto object-contain object-left sm:h-11"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-black">Shipment tracking</p>
            <p className="text-xs text-neutral-600">
              Enter the tracking number from your order. Status updates appear here as your vehicle moves.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 p-5 sm:p-6">
        <div>
          <label htmlFor="fedex-track" className="label">
            Tracking number
          </label>
          <input
            id="fedex-track"
            className="input font-mono tracking-wide"
            placeholder="e.g. 794612345678"
            value={tracking}
            onChange={(e) => {
              setTracking(e.target.value);
              setError('');
            }}
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={!tracking.trim() || loading}>
          {loading ? 'Tracking…' : 'Track shipment'}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>

      {result && (
        <div className="border-t border-white/10 px-5 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-ink-500">Tracking</p>
              <p className="mt-1 font-mono text-lg font-semibold text-white">{result.trackingNumber}</p>
              <p className="mt-1 text-sm text-emerald-300">{result.status}</p>
              <p className="mt-2 text-xs text-ink-400">
                Order{' '}
                <Link href={`/delivery?order=${result.orderReference}`} className="text-white underline">
                  {result.orderReference}
                </Link>
                {' · '}
                {result.vehicle.modelYear} {result.vehicle.model}
              </p>
              {result.deliveryAddress && (
                <p className="mt-1 text-xs text-ink-500">Deliver to: {result.deliveryAddress}</p>
              )}
            </div>
          </div>

          {/* Same pattern as order tracker: top → bottom, green line, current step */}
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
                    {step.current && step.done && step.key === 'DELIVERED' && (
                      <span className="ml-2 text-[10px] font-normal uppercase tracking-wider text-emerald-300">
                        Complete
                      </span>
                    )}
                  </p>
                  {(step.done || step.current) && step.detail && (
                    <p className="mt-0.5 text-xs text-ink-400">{step.detail}</p>
                  )}
                  {(step.done || step.current) && (step.at || step.location) && (
                    <p className="mt-1 text-[11px] text-ink-500">
                      {step.at ? new Date(step.at).toLocaleString() : ''}
                      {step.at && step.location ? ' · ' : ''}
                      {step.location || ''}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!result && (
        <div className="border-t border-white/10 px-5 py-4 sm:px-6">
          <p className="text-xs font-medium text-ink-300">Movement stages</p>
          <ol className="mt-3 space-y-3">
            {[
              { t: 'Label created', d: 'New York FedEx origin facility' },
              { t: 'Picked up', d: 'Leaves origin for the network' },
              { t: 'In transit', d: 'Hubs such as Memphis toward your city' },
              { t: 'Out for delivery', d: 'Final mile to your address' },
              { t: 'Delivered', d: 'Handover complete' },
            ].map((step, i) => (
              <li key={step.t} className="flex gap-3 text-xs">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] font-semibold text-white">
                  {i + 1}
                </span>
                <span>
                  <span className="font-medium text-ink-200">{step.t}</span>
                  <span className="mt-0.5 block text-ink-500">{step.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
