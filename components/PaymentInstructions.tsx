'use client';

import { useMemo, useState } from 'react';
import type { PaymentMethodsConfig } from '@/lib/payments';

function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(data)}`;
}

export function PaymentInstructions({
  config,
  amountLabel,
  preferredMethod,
}: {
  config: PaymentMethodsConfig;
  amountLabel?: string;
  preferredMethod?: string | null;
}) {
  const [copied, setCopied] = useState('');
  const showCrypto =
    config.cryptoEnabled &&
    config.crypto.length > 0 &&
    (!preferredMethod || preferredMethod === 'CRYPTO');
  const showWire =
    config.wireEnabled && (!preferredMethod || preferredMethod === 'WIRE');
  const showCard =
    config.creditDebitEnabled && (!preferredMethod || preferredMethod === 'CARD');

  const cryptoList = config.crypto || [];
  const [selectedId, setSelectedId] = useState(cryptoList[0]?.id || '');

  const selected = useMemo(
    () => cryptoList.find((c) => c.id === selectedId) || cryptoList[0],
    [cryptoList, selectedId]
  );

  async function copy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-semibold text-ink-950">How to pay</h2>
      {amountLabel && (
        <p className="text-sm text-ink-600">
          Amount due: <strong>{amountLabel}</strong>
        </p>
      )}

      {showCard && preferredMethod === 'CARD' && (
        <div className="rounded-xl border border-ink-200 p-4">
          <p className="font-medium text-ink-950">Credit / Debit card</p>
          <p className="mt-1 text-sm text-ink-600">
            Your card details were submitted with this order. You will receive a confirmation once payment is processed.
          </p>
        </div>
      )}

      {showCard && preferredMethod !== 'CARD' && preferredMethod !== 'CRYPTO' && preferredMethod !== 'WIRE' && (
        <div className="rounded-xl border border-ink-200 p-4">
          <p className="font-medium text-ink-950">Credit / Debit card</p>
          <p className="mt-1 text-sm text-ink-600">
            You can pay by card from the order page when placing your order.
          </p>
        </div>
      )}

      {showWire && (
        <div className="rounded-xl border border-ink-200 p-4">
          <p className="font-medium text-ink-950">Wire transfer</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-600">{config.wireInstructions}</p>
        </div>
      )}

      {showCrypto && cryptoList.length > 0 && (
        <div className="space-y-4">
          <p className="font-medium text-ink-950">Crypto</p>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <p className="font-semibold">Important — wallet accuracy & network fees</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs leading-relaxed">
              <li>
                Always verify the wallet address matches exactly (copy-paste recommended). Sending to the wrong address means funds cannot be recovered.
              </li>
              <li>
                Use the correct network for each option (BTC, USDT ERC20, USDT TRC20, USDC ERC20, USDC BNB). Assets sent on the wrong chain are usually lost.
              </li>
              <li>
                Blockchain network fees (gas / miner fees) are charged by the network and are paid by you in addition to the order amount.
              </li>
              <li>
                Only send the amount due for this order. Confirmations may take several minutes depending on network congestion.
              </li>
            </ul>
          </div>

          <div>
            <label htmlFor="crypto-select" className="mb-1.5 block text-xs font-medium text-ink-600">
              Select coin / network
            </label>
            <select
              id="crypto-select"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-950 outline-none focus:border-ink-400"
              value={selected?.id || ''}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {cryptoList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {selected && (
            <div className="grid gap-4 rounded-xl border border-ink-200 p-4 sm:grid-cols-[160px_1fr]">
              <div className="flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl(selected.address)}
                  alt={`QR code for ${selected.label}`}
                  width={160}
                  height={160}
                  className="rounded-lg border border-ink-100 bg-white p-1"
                />
                <span className="mt-1 text-[10px] uppercase tracking-wide text-ink-400">
                  Scan barcode
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-950">{selected.label}</p>
                <p className="mt-2 break-all font-mono text-xs text-ink-700">{selected.address}</p>
                <button
                  type="button"
                  onClick={() => copy(selected.id, selected.address)}
                  className="mt-3 rounded-full border border-ink-300 px-4 py-1.5 text-xs font-medium text-ink-950 hover:bg-ink-50"
                >
                  {copied === selected.id ? 'Copied' : 'Copy address'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
