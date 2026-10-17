'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function MarkNotificationsRead() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAll() {
    setLoading(true);
    await fetch('/api/admin/notifications/read', { method: 'POST' });
    setLoading(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={markAll} disabled={loading} className="btn-secondary !py-2 text-xs">
      {loading ? '…' : 'Mark all read'}
    </button>
  );
}
