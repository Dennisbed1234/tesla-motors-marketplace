'use client';

import { FormEvent, useState } from 'react';
import type { PaymentMethodsConfig, CryptoNetwork } from '@/lib/payments';

function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(data)}`;
}

export function PaymentMethodsEditor({ initial }: { initial: PaymentMethodsConfig }) {
  const [config, setConfig] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  function updateCrypto(i: number, patch: Partial<CryptoNetwork>) {
    setConfig((c) => ({
      ...c,
      crypto: c.crypto.map((row, idx) => (idx === i ? { ...row, ...patch } : row)),
    }));
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg('Copied');
      setTimeout(() => setMsg(''), 1500);
    } catch {
      setMsg('Copy failed');
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    const res = await fetch('/api/admin/payment-methods', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    setSaving(false);
    if (!res.ok) {
      setMsg('Save failed');
      return;
    }
    setMsg('Saved');
  }

  return (
    <form onSubmit={onSave} className="mt-8 space-y-8">
      <section className="card space-y-4 p-5">
        <h2 className="font-semibold">Channels</h2>
        {(
          [
            ['creditDebitEnabled', 'Credit / Debit card'],
            ['wireEnabled', 'Wire transfer'],
            ['cryptoEnabled', 'Crypto'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={config[key]}
              onChange={(e) => setConfig((c) => ({ ...c, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
        <div>
          <label className="label">Wire instructions</label>
          <textarea
            className="input min-h-[90px]"
            value={config.wireInstructions}
            onChange={(e) => setConfig((c) => ({ ...c, wireInstructions: e.target.value }))}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">Crypto addresses</h2>
        {config.crypto.map((row, i) => (
          <div key={row.id} className="card grid gap-4 p-5 sm:grid-cols-[160px_1fr]">
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl(row.address)}
                alt={`QR ${row.label}`}
                width={160}
                height={160}
                className="rounded-lg bg-white p-2"
              />
              <span className="text-xs text-ink-400">Barcode / QR</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Label</label>
                <input
                  className="input"
                  value={row.label}
                  onChange={(e) => updateCrypto(i, { label: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Address</label>
                <div className="flex gap-2">
                  <input
                    className="input font-mono text-xs"
                    value={row.address}
                    onChange={(e) => updateCrypto(i, { address: e.target.value })}
                  />
                  <button type="button" className="btn-secondary shrink-0 !px-3" onClick={() => copy(row.address)}>
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save payment methods'}
        </button>
        {msg && <span className="text-sm text-ink-300">{msg}</span>}
      </div>
    </form>
  );
}
