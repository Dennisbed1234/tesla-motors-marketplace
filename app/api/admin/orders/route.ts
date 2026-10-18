import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  parseOrderMeta,
  stringifyOrderMeta,
  ensureTrackingOnMeta,
  syncShipmentEvents,
} from '@/lib/shipping';

const updateSchema = z.object({
  orderId: z.string().min(1),
  action: z.enum([
    'CONFIRM_PAYMENT',
    'PREPARING',
    'IN_TRANSIT',
    'DELIVERED',
    'COLLECTED',
    'CANCEL',
    'REFUND',
  ]),
});

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      vehicle: { select: { model: true, trim: true, modelYear: true, slug: true } },
    },
  });

  return NextResponse.json({ orders });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid update' }, { status: 400 });
    }

    const { orderId, action } = parsed.data;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let orderStatus = order.orderStatus;
    let paymentStatus = order.paymentStatus;

    switch (action) {
      case 'CONFIRM_PAYMENT':
        paymentStatus = 'PAID';
        orderStatus = 'PAID';
        break;
      case 'PREPARING':
        paymentStatus = 'PAID';
        orderStatus = 'PAID';
        break;
      case 'IN_TRANSIT':
        paymentStatus = 'PAID';
        orderStatus = 'PROCESSING';
        break;
      case 'DELIVERED':
        paymentStatus = 'PAID';
        orderStatus = 'DELIVERED';
        break;
      case 'COLLECTED':
        paymentStatus = 'PAID';
        orderStatus = 'COLLECTED';
        break;
      case 'CANCEL':
        orderStatus = 'CANCELLED';
        break;
      case 'REFUND':
        orderStatus = 'REFUNDED';
        paymentStatus = 'REFUNDED';
        break;
    }

    let meta = parseOrderMeta(order.internalNotes);

    // Auto-issue tracking number when payment is confirmed / transport starts
    if (
      paymentStatus === 'PAID' &&
      orderStatus !== 'CANCELLED' &&
      orderStatus !== 'REFUNDED'
    ) {
      meta = ensureTrackingOnMeta(meta);
      meta = syncShipmentEvents(meta, orderStatus);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: orderStatus as never,
        paymentStatus: paymentStatus as never,
        internalNotes: stringifyOrderMeta(meta),
      },
      include: {
        user: { select: { fullName: true, email: true } },
        vehicle: { select: { model: true, trim: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      order: updated,
      carrierTracking: meta.carrierTracking || null,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
