'use client';

import { FormEvent, useState } from 'react';

export function FedExTracker() {
  const [tracking, setTracking] = useState('');
  const [status, setStatus] = useState<'idle' | 'looking' | 'ready'>('idle');

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const code = tracking.trim();
    if (!code) return;
    setStatus('looking');
    // Open official FedEx track page with the number prefilled
    const url = `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(code)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => setStatus('ready'), 600);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-ink-900 to-ink-950">
      <div className="border-b border-white/10 bg-[#4D148C]/20 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4D148C] text-xs font-bold tracking-tight text-white">
            FX
          </span>
          <div>
            <p className="text-sm font-semibold text-white">FedEx tracking</p>
            <p className="text-xs text-ink-400">Enter the tracking number from your delivery email</p>
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
            placeholder="e.g. 1234 5678 9012"
            value={tracking}
            onChange={(e) => {
              setTracking(e.target.value);
              setStatus('idle');
            }}
            autoComplete="off"
          />
        </div>
        <button type="submit" className="btn-primary w-full sm:w-auto" disabled={!tracking.trim()}>
          {status === 'looking' ? 'Opening FedEx…' : 'Track shipment'}
        </button>
        {status === 'ready' && (
          <p className="text-xs text-ink-400">
            Tracking opened in a new tab. If nothing appeared, allow pop-ups for this site or visit{' '}
            <a
              href="https://www.fedex.com/en-us/tracking.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline"
            >
              fedex.com/tracking
            </a>
            .
          </p>
        )}
      </form>

      <div className="border-t border-white/10 px-5 py-4 sm:px-6">
        <p className="text-xs font-medium text-ink-300">Typical vehicle transport timeline</p>
        <ol className="mt-3 space-y-3">
          {[
            { t: 'Order confirmed', d: 'Payment verified and vehicle assigned' },
            { t: 'Preparing for transport', d: 'Inspection and logistics booking' },
            { t: 'In transit (FedEx Freight / partner)', d: 'Live updates via your tracking number' },
            { t: 'Out for delivery', d: 'Final mile to your address or collection point' },
            { t: 'Delivered', d: 'Handover, paperwork, and keys' },
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
    </div>
  );
}
