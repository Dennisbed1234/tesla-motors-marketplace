import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { reservationRef } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const { vehicleId } = await req.json();
    if (!vehicleId) return NextResponse.json({ error: 'vehicleId required' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle || !vehicle.published) {
        throw new Error('Vehicle not found');
      }
      if (vehicle.inventoryStatus !== 'AVAILABLE') {
        throw new Error('Vehicle is not available for reservation');
      }

      const active = await tx.reservation.findFirst({
        where: {
          vehicleId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });
      if (active) throw new Error('Vehicle already has an active reservation');

      const deposit = vehicle.depositAmount ?? 500;
      const reference = reservationRef();
      const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      const reservation = await tx.reservation.create({
        data: {
          reference,
          userId: session.id,
          vehicleId,
          depositAmount: deposit,
          currency: vehicle.currency,
          status: 'PENDING',
          paymentStatus: 'NONE',
          expiresAt,
        },
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { inventoryStatus: 'RESERVED' },
      });

      await tx.auditLog.create({
        data: {
          adminId: session.id,
          action: 'RESERVATION_CREATED',
          entityType: 'Reservation',
          entityId: reservation.id,
          meta: { reference, vehicleId },
        },
      }).catch(() => null);

      return reservation;
    });

    return NextResponse.json({
      ok: true,
      reference: result.reference,
      id: result.id,
      status: result.status,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Reservation failed';
    const status =
      message.includes('available') || message.includes('active') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
