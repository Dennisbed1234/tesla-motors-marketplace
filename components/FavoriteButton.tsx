'use client';

import { useState } from 'react';

export function FavoriteButton({ vehicleId }: { vehicleId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId }),
      });
      const data = await res.json();
      if (res.ok) setSaved(!!data.saved);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={toggle} disabled={busy} className="btn-secondary">
      {saved ? 'Saved' : 'Save to favorites'}
    </button>
  );
}
