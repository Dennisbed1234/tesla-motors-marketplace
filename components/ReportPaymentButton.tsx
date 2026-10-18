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
  const [done, setDone] = useState(Boolean(alreadyReported || alreadyPaid));
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
    <div className="rounded-xl border-2 border-ink-950 bg-white p-5 shadow-sm">
      <p className="text-base font-semibold text-ink-950">Already sent the payment?</p>
      <p className="mt-1 text-sm text-ink-600">
        After you transfer funds, tap the button below. Our team will verify and update your tracking.
      </p>
      {!done ? (
        <button
          type="button"
          onClick={onClick}
          disabled={loading}
          className="mt-4 w-full rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-60"
        >
          {loading ? 'Submitting…' : "I've made payment"}
        </button>
      ) : (
        <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
