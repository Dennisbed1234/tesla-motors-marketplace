import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  parseOrderMeta,
  stringifyOrderMeta,
  ensureTrackingOnMeta,
  syncShipmentEvents,
  applyShipStep,
  orderStatusForShipStep,
  type ShipStepCode,
} from '@/lib/shipping';

const updateSchema = z.object({
  orderId: z.string().min(1),
  action: z.enum([
    'CONFIRM_PAYMENT',
    'PREPARING',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COLLECTED',
    'CANCEL',
    'REFUND',
    'SHIP_LABEL',
    'SHIP_PICKED_UP',
    'SHIP_IN_TRANSIT',
    'SHIP_OUT_FOR_DELIVERY',
    'SHIP_DELIVERED',
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

    let orderStatus = order.orderStatus as string;
    let paymentStatus = order.paymentStatus as string;
    let meta = parseOrderMeta(order.internalNotes);

    const shipMap: Record<string, ShipStepCode> = {
      SHIP_LABEL: 'LABEL',
      SHIP_PICKED_UP: 'PICKED_UP',
      SHIP_IN_TRANSIT: 'IN_TRANSIT',
      SHIP_OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
      SHIP_DELIVERED: 'DELIVERED',
    };

    if (action in shipMap) {
      const code = shipMap[action];
      paymentStatus = 'PAID';
      orderStatus = orderStatusForShipStep(code);
      meta = applyShipStep(meta, code);
    } else {
      switch (action) {
        case 'CONFIRM_PAYMENT':
          paymentStatus = 'PAID';
          orderStatus = 'PAID';
          meta = ensureTrackingOnMeta(meta);
          meta = applyShipStep(meta, 'LABEL');
          break;
        case 'PREPARING':
          paymentStatus = 'PAID';
          orderStatus = 'PAID';
          meta = applyShipStep(meta, 'PICKED_UP');
          break;
        case 'IN_TRANSIT':
          paymentStatus = 'PAID';
          orderStatus = 'PROCESSING';
          meta = applyShipStep(meta, 'IN_TRANSIT');
          break;
        case 'OUT_FOR_DELIVERY':
          paymentStatus = 'PAID';
          orderStatus = 'PROCESSING';
          meta = applyShipStep(meta, 'OUT_FOR_DELIVERY');
          break;
        case 'DELIVERED':
          paymentStatus = 'PAID';
          orderStatus = 'DELIVERED';
          meta = applyShipStep(meta, 'DELIVERED');
          break;
        case 'COLLECTED':
          paymentStatus = 'PAID';
          orderStatus = 'COLLECTED';
          meta = applyShipStep(meta, 'DELIVERED');
          break;
        case 'CANCEL':
          orderStatus = 'CANCELLED';
          break;
        case 'REFUND':
          orderStatus = 'REFUNDED';
          paymentStatus = 'REFUNDED';
          break;
        default:
          meta = syncShipmentEvents(meta, orderStatus);
      }
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
      shipmentEvents: meta.shipmentEvents || [],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
