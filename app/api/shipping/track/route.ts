import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseOrderMeta, currentShipmentStatus } from '@/lib/shipping';

/** Look up internal carrier tracking by number (on-site, no external FedEx redirect). */
export async function GET(req: NextRequest) {
  const number = (req.nextUrl.searchParams.get('number') || '').replace(/\s+/g, '').trim();

  if (!number || number.length < 8) {
    return NextResponse.json({ error: 'Enter a valid tracking number' }, { status: 400 });
  }

  try {
    // Scan recent paid/processing orders for matching carrierTracking in notes
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
    const events = meta.shipmentEvents || [];

    return NextResponse.json({
      trackingNumber: meta.carrierTracking,
      status: currentShipmentStatus(events),
      orderReference: order.reference,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      vehicle: order.vehicle,
      events: events.slice().reverse(), // newest first for display
      message: 'Tracked on Tesla Motors Marketplace logistics.',
    });
  } catch (e) {
    console.error('shipping track', e);
    return NextResponse.json({ error: 'Unable to look up tracking right now' }, { status: 500 });
  }
}
