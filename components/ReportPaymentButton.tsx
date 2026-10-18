'use client';

import { useState } from 'react';

export function ReportPaymentButton({
  reference,
  alreadyReported,
  alreadyPaid,
}: {
  reference: string;
  alreadyReported?: boolean;
  alreadyPaid?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(alreadyReported || alreadyPaid || false);
  const [message, setMessage] = useState(
    alreadyPaid
      ? 'Payment confirmed by our team.'
      : alreadyReported
        ? 'Payment report received. Waiting for team verification.'
        : ''
  );
  const [error, setError] = useState('');

  async function onClick() {
    if (done || alreadyPaid) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders/report-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not submit');
        return;
      }
      setDone(true);
      setMessage(data.message || 'Thanks. Our team will verify your payment.');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (alreadyPaid) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        Payment confirmed by our team.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
      <p className="text-sm font-medium text-ink-950">Already sent the payment?</p>
      <p className="mt-1 text-xs text-ink-600">
        Tap below after you transfer funds. Our team will verify and update your tracking status.
        This does not mark the order paid by itself.
      </p>
      {!done ? (
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="mt-3 w-full rounded-full bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
        >
          {loading ? 'Submitting…' : "I've made payment"}
        </button>
      ) : (
        <p className="mt-3 text-sm text-emerald-800">{message}</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
