import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notify';

const schema = z.object({
  reference: z.string().min(6),
  note: z.string().max(500).optional(),
});

/** Customer: "I have made payment" — does NOT mark paid until admin confirms. */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Order reference required' }, { status: 400 });
    }

    const reference = parsed.data.reference.trim().toUpperCase();
    const order = await prisma.order.findUnique({
      where: { reference },
      include: { vehicle: true, user: true },
    });

    if (!order || order.userId !== session.id) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.paymentStatus === 'PAID' || order.orderStatus === 'PAID' || order.orderStatus === 'PROCESSING') {
      return NextResponse.json({ ok: true, message: 'Payment already confirmed for this order.' });
    }

    let meta: Record<string, unknown> = {};
    try {
      meta = order.internalNotes ? JSON.parse(order.internalNotes) : {};
    } catch {
      meta = {};
    }
    meta.paymentReportedAt = new Date().toISOString();
    meta.paymentReportNote = parsed.data.note || null;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING_PAYMENT',
        internalNotes: JSON.stringify(meta),
      },
    });

    await notifyAdmins({
      type: 'PAYMENT_REPORTED',
      title: `Payment reported: ${order.reference}`,
      body: `${session.fullName} (${session.email}) reported payment for ${order.vehicle.model} ${order.vehicle.trim}. Review and confirm in Admin → Orders.`,
      href: '/admin/orders',
      emailSubject: `[Payment reported] ${order.reference}`,
      emailText: `Customer reported payment for order ${order.reference}.\nConfirm in admin: /admin/orders`,
    });

    return NextResponse.json({
      ok: true,
      message: 'Thanks. We notified our team to verify your payment. Tracking will update once confirmed.',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
