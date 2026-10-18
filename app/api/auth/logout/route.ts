import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth';

export async function POST() {
  await destroySession();
  const res = NextResponse.json({ ok: true });
  // Hint client to clear chat keys (also cleared in SiteNav logout)
  res.headers.set('Clear-Site-Data', '"cookies"');
  return res;
}
