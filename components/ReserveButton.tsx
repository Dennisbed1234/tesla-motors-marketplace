'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function ReserveButton({ vehicleId }: { vehicleId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  async function onReserve() {
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || 'Reservation failed');
        return;
      }
      setMsg(`Reserved · ${data.reference}`);
      router.refresh();
      router.push('/account');
    } catch {
      setMsg('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={onReserve} disabled={loading} className="btn-primary">
        {loading ? 'Checking availability…' : 'Reserve vehicle'}
      </button>
      {msg && <p className="text-xs text-ink-300">{msg}</p>}
    </div>
  );
}
