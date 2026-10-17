import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

  const { vehicleId } = await req.json();
  if (!vehicleId) return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_vehicleId: { userId: session.id, vehicleId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.favorite.create({ data: { userId: session.id, vehicleId } });
  return NextResponse.json({ saved: true });
}
