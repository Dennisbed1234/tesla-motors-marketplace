'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/utils';

type Plan = 'FULL' | 'DEPOSIT_50' | 'DEPOSIT_25';
type PayMethod = 'CARD' | 'WIRE' | 'CRYPTO';

export function OrderForm({
  vehicleId,
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
  const [method, setMethod] = useState<PayMethod>('CARD');
  const [notes, setNotes] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const amount =
    plan === 'FULL' ? full : plan === 'DEPOSIT_50' ? fifty : twentyFive;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (method === 'CARD') {
      const digits = cardNumber.replace(/\s+/g, '');
      if (digits.length < 13 || digits.length > 19) {
        setError('Enter a valid card number');
        setLoading(false);
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim()) && !/^\d{2}\/\d{4}$/.test(cardExpiry.trim())) {
        setError('Expiry must be MM/YY');
        setLoading(false);
        return;
      }
      if (cardCvv.replace(/\s/g, '').length < 3) {
        setError('Enter CVV');
        setLoading(false);
        return;
      }
      if (!cardName.trim()) {
        setError('Enter name on card');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId,
          paymentPlan: plan,
          paymentMethod: method,
          notes,
          card:
            method === 'CARD'
              ? {
                  name: cardName.trim(),
                  number: cardNumber.replace(/\s+/g, ''),
                  expiry: cardExpiry.trim(),
                  cvv: cardCvv.trim(),
                }
              : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Order failed');
        return;
      }
      router.push(`/orders/${data.reference}/confirmed?method=${method}`);
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
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Amount</h2>
        <div className="mt-3 space-y-3">
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
      </div>

      <div>
        <h2 className="text-lg font-semibold">Pay with</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(
            [
              ['CARD', '💳 Card'],
              ['WIRE', 'Wire transfer'],
              ['CRYPTO', 'Crypto'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMethod(id)}
              className={`rounded-xl border px-3 py-3 text-sm ${
                method === id ? 'border-white/40 bg-ink-800' : 'border-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {method === 'CARD' && (
        <div className="card space-y-3 p-5">
          <p className="text-sm font-medium">Credit / Debit card</p>
          <div>
            <label className="label" htmlFor="cardName">Name on card</label>
            <input
              id="cardName"
              className="input"
              autoComplete="cc-name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required={method === 'CARD'}
            />
          </div>
          <div>
            <label className="label" htmlFor="cardNumber">Card number</label>
            <input
              id="cardNumber"
              className="input font-mono"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="•••• •••• •••• ••••"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              required={method === 'CARD'}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="cardExpiry">Expiry (MM/YY)</label>
              <input
                id="cardExpiry"
                className="input"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                required={method === 'CARD'}
              />
            </div>
            <div>
              <label className="label" htmlFor="cardCvv">CVV</label>
              <input
                id="cardCvv"
                className="input"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value)}
                required={method === 'CARD'}
              />
            </div>
          </div>
        </div>
      )}

      {method === 'CRYPTO' && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-50">
          <p className="font-medium">Before you send crypto</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-100/90">
            <li>Double-check the wallet address character by character. Funds sent to the wrong address cannot be recovered.</li>
            <li>Select the correct network (e.g. ERC20 vs TRC20 vs BNB). Wrong network = permanent loss.</li>
            <li>Network fees (gas / miner fees) are paid by you and are separate from the order amount.</li>
            <li>Send only the exact amount due. Confirmation can take several minutes depending on the network.</li>
          </ul>
        </div>
      )}

      {method === 'WIRE' && (
        <p className="text-sm text-ink-400">
          Wire instructions and bank details will appear on your confirmation page after you place the order.
        </p>
      )}

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
    </form>
  );
}
