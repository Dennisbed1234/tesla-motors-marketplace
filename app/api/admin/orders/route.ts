import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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

    let data: { orderStatus?: string; paymentStatus?: string } = {};

    switch (action) {
      case 'CONFIRM_PAYMENT':
        data = { paymentStatus: 'PAID', orderStatus: 'PAID' };
        break;
      case 'PREPARING':
        data = { paymentStatus: 'PAID', orderStatus: 'PAID' };
        break;
      case 'IN_TRANSIT':
        data = { paymentStatus: 'PAID', orderStatus: 'PROCESSING' };
        break;
      case 'DELIVERED':
        data = { paymentStatus: 'PAID', orderStatus: 'DELIVERED' };
        break;
      case 'COLLECTED':
        data = { paymentStatus: 'PAID', orderStatus: 'COLLECTED' };
        break;
      case 'CANCEL':
        data = { orderStatus: 'CANCELLED' };
        break;
      case 'REFUND':
        data = { orderStatus: 'REFUNDED', paymentStatus: 'REFUNDED' };
        break;
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: data as never,
      include: {
        user: { select: { fullName: true, email: true } },
        vehicle: { select: { model: true, trim: true } },
      },
    });

    return NextResponse.json({ ok: true, order: updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
