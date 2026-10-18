import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  parseOrderMeta,
  currentShipmentStatus,
  formatDeliveryAddress,
} from '@/lib/shipping';

/** Fixed pipeline stages (chronological: first at top). */
const PIPELINE = [
  {
    key: 'LABEL',
    codes: ['LABEL'],
    label: 'Shipping label created',
  },
  {
    key: 'PICKED_UP',
    codes: ['PICKED_UP'],
    label: 'Picked up',
  },
  {
    key: 'IN_TRANSIT',
    codes: ['IN_TRANSIT', 'IN_TRANSIT_DEPART_ORIGIN', 'IN_TRANSIT_HUB'],
    label: 'In transit',
  },
  {
    key: 'OUT_FOR_DELIVERY',
    codes: ['OUT_FOR_DELIVERY', 'AT_LOCAL'],
    label: 'Out for delivery',
  },
  {
    key: 'DELIVERED',
    codes: ['DELIVERED'],
    label: 'Delivered',
  },
] as const;

export async function GET(req: NextRequest) {
  const number = (req.nextUrl.searchParams.get('number') || '').replace(/\s+/g, '').trim();

  if (!number || number.length < 8) {
    return NextResponse.json({ error: 'Enter a valid tracking number' }, { status: 400 });
  }

  try {
    const candidates = await prisma.order.findMany({
      where: {
        paymentStatus: { in: ['PAID', 'PENDING'] },
        orderStatus: { notIn: ['CANCELLED'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 200,
      include: {
        vehicle: {
          select: { model: true, trim: true, modelYear: true, slug: true },
        },
      },
    });

    const order = candidates.find((o) => {
      const meta = parseOrderMeta(o.internalNotes);
      return meta.carrierTracking === number;
    });

    if (!order) {
      return NextResponse.json({ error: 'No shipment found for that tracking number' }, { status: 404 });
    }

    const meta = parseOrderMeta(order.internalNotes);
    // Chronological: oldest first
    const events = [...(meta.shipmentEvents || [])].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime()
    );

    const dest = formatDeliveryAddress(meta.deliveryAddress);

    // Highest stage reached
    let reached = -1;
    PIPELINE.forEach((stage, i) => {
      if (events.some((e) => (stage.codes as readonly string[]).includes(e.code))) {
        reached = i;
      }
    });

    const steps = PIPELINE.map((stage, i) => {
      const related = events.filter((e) => (stage.codes as readonly string[]).includes(e.code));
      const last = related[related.length - 1];
      const done = i < reached || (i === reached && stage.key === 'DELIVERED');
      const current = i === reached && stage.key !== 'DELIVERED';
      // When delivered, last step is done and current
      const isDeliveredDone = stage.key === 'DELIVERED' && i === reached;

      return {
        key: stage.key,
        label: stage.label,
        done: done || isDeliveredDone,
        current: current || (isDeliveredDone && true),
        detail: last?.detail || defaultDetail(stage.key, dest),
        location: last?.location || defaultLocation(stage.key, dest),
        at: last?.at || null,
      };
    });

    // Only one current: last reached if not fully delivered, else delivered is done
    const anyDelivered = steps.some((s) => s.key === 'DELIVERED' && s.done);
    steps.forEach((s, i) => {
      if (anyDelivered) {
        s.current = s.key === 'DELIVERED';
        s.done = true;
      } else {
        s.current = i === reached;
        s.done = i < reached;
      }
    });

    return NextResponse.json({
      trackingNumber: meta.carrierTracking,
      status: currentShipmentStatus(events),
      orderReference: order.reference,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      vehicle: order.vehicle,
      deliveryAddress: dest || null,
      steps,
      events,
      message: 'Tracked on Tesla Motors Marketplace logistics.',
    });
  } catch (e) {
    console.error('shipping track', e);
    return NextResponse.json({ error: 'Unable to look up tracking right now' }, { status: 500 });
  }
}

function defaultDetail(key: string, dest: string) {
  switch (key) {
    case 'LABEL':
      return dest
        ? `Label created for delivery to ${dest}.`
        : 'Shipping label created at origin.';
    case 'PICKED_UP':
      return 'Picked up at FedEx origin facility in New York.';
    case 'IN_TRANSIT':
      return dest
        ? `Moving through the FedEx network toward ${dest}.`
        : 'Moving through the FedEx network.';
    case 'OUT_FOR_DELIVERY':
      return dest ? `Out for delivery to ${dest}.` : 'Out for delivery.';
    case 'DELIVERED':
      return dest ? `Delivered to ${dest}.` : 'Delivered.';
    default:
      return '';
  }
}

function defaultLocation(key: string, dest: string) {
  switch (key) {
    case 'LABEL':
    case 'PICKED_UP':
      return 'FedEx Express, JFK Cargo, Queens, NY';
    case 'IN_TRANSIT':
      return 'FedEx SuperHub, Memphis, TN';
    case 'OUT_FOR_DELIVERY':
    case 'DELIVERED':
      return dest || 'Delivery address';
    default:
      return '';
  }
}
