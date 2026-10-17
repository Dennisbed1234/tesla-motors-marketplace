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

    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || !vehicle.published) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
    }
    if (vehicle.inventoryStatus === 'SOLD' || vehicle.inventoryStatus === 'UNAVAILABLE') {
      return NextResponse.json({ error: 'Vehicle is not available for reservation' }, { status: 409 });
    }

    const deposit = vehicle.depositAmount ?? 500;
    const reference = reservationRef();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const reservation = await prisma.reservation.create({
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

    // Unique one-off units (have a VIN): mark reserved. Bulk/catalog rows stay AVAILABLE.
    if (vehicle.vin) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { inventoryStatus: 'RESERVED' },
      });
    }

    return NextResponse.json({
      ok: true,
      reference: reservation.reference,
      id: reservation.id,
      status: reservation.status,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Reservation failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
