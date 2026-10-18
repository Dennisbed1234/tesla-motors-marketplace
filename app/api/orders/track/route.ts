import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseOrderMeta } from '@/lib/shipping';

/** Public order tracking by order reference (ORD-…). Limited fields only. */
export async function GET(req: NextRequest) {
  const reference = (req.nextUrl.searchParams.get('reference') || '').trim().toUpperCase();

  if (!reference || reference.length < 6) {
    return NextResponse.json({ error: 'Enter a valid order number' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { reference },
      include: {
        vehicle: {
          select: {
            model: true,
            trim: true,
            modelYear: true,
            slug: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'No order found for that number' }, { status: 404 });
    }

    const meta = parseOrderMeta(order.internalNotes);
    const steps = buildTimeline(order.orderStatus, order.paymentStatus, order.createdAt);

    return NextResponse.json({
      reference: order.reference,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      vehicle: {
        model: order.vehicle.model,
        trim: order.vehicle.trim,
        modelYear: order.vehicle.modelYear,
        slug: order.vehicle.slug,
      },
      currency: order.currency,
      sellingPrice: order.sellingPrice.toString(),
      carrierTracking: meta.carrierTracking || null,
      steps,
      message: 'We deliver worldwide. Your order is tracked from placement through delivery.',
    });
  } catch (e) {
    console.error('Order track failed', e);
    return NextResponse.json({ error: 'Unable to look up order right now' }, { status: 500 });
  }
}

function buildTimeline(orderStatus: string, paymentStatus: string, createdAt: Date) {
  const cancelled = orderStatus === 'CANCELLED' || orderStatus === 'REFUNDED';
  if (cancelled) {
    return [
      { key: 'placed', label: 'Order placed', done: true, current: false, at: createdAt.toISOString() },
      {
        key: 'cancelled',
        label: orderStatus === 'REFUNDED' ? 'Refunded' : 'Cancelled',
        done: true,
        current: true,
        at: null,
      },
    ];
  }

  const paymentConfirmed =
    paymentStatus === 'PAID' ||
    orderStatus === 'PAID' ||
    orderStatus === 'PROCESSING' ||
    orderStatus === 'DELIVERED' ||
    orderStatus === 'COLLECTED';

  const paymentReported = paymentStatus === 'PENDING' && !paymentConfirmed;

  const inTransit =
    orderStatus === 'PROCESSING' || orderStatus === 'DELIVERED' || orderStatus === 'COLLECTED';

  const delivered = orderStatus === 'DELIVERED' || orderStatus === 'COLLECTED';

  let paymentLabel = 'Awaiting payment';
  if (paymentConfirmed) paymentLabel = 'Payment confirmed';
  else if (paymentReported) paymentLabel = 'Payment reported (pending review)';

  const awaitingPayment =
    !paymentConfirmed &&
    !paymentReported &&
    (orderStatus === 'INQUIRY' || orderStatus === 'PENDING_PAYMENT' || paymentStatus === 'NONE');

  return [
    {
      key: 'placed',
      label: 'Order placed',
      done: true,
      current: false,
      at: createdAt.toISOString(),
    },
    {
      key: 'payment',
      label: paymentLabel,
      done: paymentConfirmed,
      current: awaitingPayment || paymentReported,
      at: null,
    },
    {
      key: 'preparing',
      label: 'Preparing for transport',
      done: inTransit,
      current: orderStatus === 'PAID' && !inTransit,
      at: null,
    },
    {
      key: 'transit',
      label: 'In transit (worldwide delivery)',
      done: delivered,
      current: orderStatus === 'PROCESSING' && !delivered,
      at: null,
    },
    {
      key: 'delivered',
      label: orderStatus === 'COLLECTED' ? 'Collected' : 'Delivered',
      done: delivered,
      current: delivered,
      at: null,
    },
  ];
}
