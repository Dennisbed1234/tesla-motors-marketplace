import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.adminNotification.updateMany({
    where: { read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
