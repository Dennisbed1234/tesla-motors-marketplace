import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notifyAdmins } from '@/lib/notify';
import { parseOrderMeta, stringifyOrderMeta } from '@/lib/shipping';

const schema = z.object({
  reference: z.string().min(6),
});

/** Customer cancels/deletes their order. Notifies admin. Soft-cancels (keeps record for admin). */
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
      include: { vehicle: true },
    });

    if (!order || order.userId !== session.id) {
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

    // Remove related payments rows optional - keep for audit

    await notifyAdmins({
      type: 'ORDER_CANCELLED',
      title: `Customer deleted order ${order.reference}`,
      body: `${session.fullName} (${session.email}) cancelled/deleted order ${order.reference} (${order.vehicle.model} ${order.vehicle.trim}). Review in Admin → Orders. You can permanently remove it from the dashboard.`,
      href: '/admin/orders',
      emailSubject: `[Order cancelled] ${order.reference}`,
      emailText: `Customer ${session.fullName} <${session.email}> deleted/cancelled order ${order.reference}.\nVehicle: ${order.vehicle.model} ${order.vehicle.trim}\nOpen Admin → Orders to remove it permanently if needed.`,
    });

    return NextResponse.json({
      ok: true,
      message: 'Order removed. Our team has been notified.',
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
