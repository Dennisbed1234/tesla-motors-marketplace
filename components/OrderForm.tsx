'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/utils';

type Plan = 'FULL' | 'DEPOSIT_50' | 'DEPOSIT_25';
type PayMethod = 'CARD' | 'WIRE' | 'CRYPTO';

type Addr = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

export function OrderForm({
  vehicleId,
  currency,
  full,
  fifty,
  twentyFive,
  profileAddress,
}: {
  vehicleId: string;
  slug: string;
  currency: string;
  full: number;
  fifty: number;
  twentyFive: number;
  profileAddress: Addr;
}) {
  const hasProfile = Boolean(profileAddress.line1 && profileAddress.city);
  const [plan, setPlan] = useState<Plan>('DEPOSIT_25');
  const [method, setMethod] = useState<PayMethod>('CARD');
  const [notes, setNotes] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [billing, setBilling] = useState<Addr>({ ...profileAddress });
  const [deliveryMode, setDeliveryMode] = useState<'PROFILE' | 'NEW'>(hasProfile ? 'PROFILE' : 'NEW');
  const [delivery, setDelivery] = useState<Addr>({ ...profileAddress });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const amount =
    plan === 'FULL' ? full : plan === 'DEPOSIT_50' ? fifty : twentyFive;

  function addrValid(a: Addr) {
    return a.line1.trim() && a.city.trim() && a.state.trim() && a.postal.trim() && a.country.trim();
  }

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
      if (!addrValid(billing)) {
        setError('Complete billing address');
        setLoading(false);
        return;
      }
    }

    // Required for Card, Crypto, and Wire
    const ship = deliveryMode === 'PROFILE' && hasProfile ? profileAddress : delivery;
    if (deliveryMode === 'PROFILE' && !hasProfile) {
      setError('No address on file — choose a new delivery address');
      setLoading(false);
      return;
    }
    if (!addrValid(ship)) {
      setError('Choose delivery: address on file or enter a new mailing address');
      setLoading(false);
      return;
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
          billingAddress: method === 'CARD' ? billing : undefined,
          deliveryMode,
          deliveryAddress: ship,
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
    { id: 'DEPOSIT_25', title: '25% down payment', amount: twentyFive, hint: 'Mandatory minimum' },
    { id: 'DEPOSIT_50', title: '50% deposit', amount: fifty, hint: 'Half now' },
    { id: 'FULL', title: 'Full payment', amount: full, hint: 'Full vehicle price' },
  ];

  function AddrFields({
    value,
    onChange,
  }: {
    value: Addr;
    onChange: (a: Addr) => void;
  }) {
    return (
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Street address"
          value={value.line1}
          onChange={(e) => onChange({ ...value, line1: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Apt / suite (optional)"
          value={value.line2}
          onChange={(e) => onChange({ ...value, line2: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <input className="input" placeholder="City" value={value.city} onChange={(e) => onChange({ ...value, city: e.target.value })} required />
          <input className="input" placeholder="State" value={value.state} onChange={(e) => onChange({ ...value, state: e.target.value })} required />
          <input className="input" placeholder="ZIP" value={value.postal} onChange={(e) => onChange({ ...value, postal: e.target.value })} required />
        </div>
        <input className="input" placeholder="Country" value={value.country} onChange={(e) => onChange({ ...value, country: e.target.value })} required />
      </div>
    );
  }

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
              <input type="radio" name="plan" className="mt-1" checked={plan === o.id} onChange={() => setPlan(o.id)} />
              <div className="flex-1">
                <p className="font-medium">{o.title}</p>
                <p className="text-xs text-ink-400">{o.hint}</p>
              </div>
              <p className="text-lg font-semibold">{formatMoney(o.amount, currency)}</p>
            </label>
          ))}
        </div>
      </div>

      {/* Delivery required for every payment method including card & crypto */}
      <div className="card space-y-3 border-white/20 p-5">
        <h2 className="text-lg font-semibold">Delivery address</h2>
        <p className="text-xs text-ink-400">
          Required for card, crypto, and wire. Choose the address on your account or enter a new mailing address.
        </p>
        <label className="flex items-start gap-2 text-sm">
          <input
            type="radio"
            className="mt-1"
            checked={deliveryMode === 'PROFILE'}
            onChange={() => setDeliveryMode('PROFILE')}
            disabled={!hasProfile}
          />
          <span>
            Use address on file
            {hasProfile ? (
              <span className="mt-1 block text-xs text-ink-400">
                {profileAddress.line1}
                {profileAddress.line2 ? `, ${profileAddress.line2}` : ''}, {profileAddress.city},{' '}
                {profileAddress.state} {profileAddress.postal}, {profileAddress.country}
              </span>
            ) : (
              <span className="mt-1 block text-xs text-amber-300">No address on file — select new address below</span>
            )}
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" checked={deliveryMode === 'NEW'} onChange={() => setDeliveryMode('NEW')} />
          Enter a new mailing address
        </label>
        {deliveryMode === 'NEW' && <AddrFields value={delivery} onChange={setDelivery} />}
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
        <div className="card space-y-4 p-5">
          <p className="text-sm font-medium">Credit / Debit card</p>
          <input className="input" placeholder="Name on card" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
          <input className="input font-mono" placeholder="Card number" inputMode="numeric" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="input" placeholder="MM/YY" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} required />
            <input className="input" placeholder="CVV" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} required />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Billing address</p>
            <AddrFields value={billing} onChange={setBilling} />
          </div>
        </div>
      )}

      {method === 'CRYPTO' && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-50">
          <p className="font-medium">Before you send crypto</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-100/90">
            <li>Double-check the wallet address. Funds sent to the wrong address cannot be recovered.</li>
            <li>Select the correct network (ERC20 vs TRC20 vs BNB).</li>
            <li>Network fees are paid by you and are separate from the order amount.</li>
          </ul>
        </div>
      )}

      {method === 'WIRE' && (
        <p className="text-sm text-ink-400">Wire instructions appear on your confirmation page after you place the order.</p>
      )}

      <div>
        <label className="label" htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" className="input min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div className="rounded-xl border border-white/10 bg-ink-900/60 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-400">Due now</span>
          <span className="text-xl font-semibold">{formatMoney(amount, currency)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Creating order…' : 'Create order'}
      </button>
    </form>
  );
}
