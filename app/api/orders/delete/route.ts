import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notify';
import { parseOrderMeta, stringifyOrderMeta } from '@/lib/shipping';

const schema = z.object({
  reference: z.string().min(4),
});

/** Customer cancels/deletes their order. Notifies admin. Soft-cancels (keeps record for admin). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.id) {
    return NextResponse.json({ error: 'Please log in again to delete this order' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Order reference required' }, { status: 400 });
    }

    const reference = parsed.data.reference.trim().toUpperCase();
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ reference }, { reference: parsed.data.reference.trim() }],
        userId: session.id,
      },
      include: { vehicle: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.orderStatus === 'DELIVERED' || order.orderStatus === 'COLLECTED') {
      return NextResponse.json(
        { error: 'Delivered orders cannot be deleted. Contact support.' },
        { status: 400 }
      );
    }

    if (order.orderStatus === 'CANCELLED') {
      return NextResponse.json({ ok: true, message: 'Order already cancelled.' });
    }

    const meta = parseOrderMeta(order.internalNotes);
    meta.cancelledByCustomer = true;
    meta.cancelledAt = new Date().toISOString();

    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: 'CANCELLED',
        internalNotes: stringifyOrderMeta(meta),
      },
    });

    const customerName = session.fullName || 'Customer';
    const customerEmail = session.email || '';
    const vehicleLabel = order.vehicle
      ? `${order.vehicle.model} ${order.vehicle.trim}`
      : 'Vehicle';

    // Notify admin but never fail the delete if email/DB notify fails
    await notifyAdmins({
      type: 'ORDER_CANCELLED',
      title: `Customer deleted order ${order.reference}`,
      body: `${customerName} (${customerEmail}) cancelled/deleted order ${order.reference} (${vehicleLabel}). Review in Admin → Orders.`,
      href: '/admin/orders',
      emailSubject: `[Order cancelled] ${order.reference}`,
      emailText: `Customer ${customerName} <${customerEmail}> deleted/cancelled order ${order.reference}.\nVehicle: ${vehicleLabel}\nOpen Admin → Orders to remove it permanently if needed.`,
    }).catch((e) => console.error('notifyAdmins on delete failed', e));

    return NextResponse.json({
      ok: true,
      message: 'Order removed. Our team has been notified.',
    });
  } catch (e) {
    console.error('orders/delete', e);
    return NextResponse.json({ error: 'Server error — please try again' }, { status: 500 });
  }
}
