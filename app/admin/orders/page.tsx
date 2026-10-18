import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';
import { parseOrderMeta, formatDeliveryAddress } from '@/lib/shipping';
import { AdminOrderActions } from '@/components/AdminOrderActions';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/admin/login');

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      vehicle: { select: { model: true, trim: true, modelYear: true } },
    },
  });

  const needsReview = orders.filter(
    (o) => o.paymentStatus === 'PENDING' && o.orderStatus === 'PENDING_PAYMENT'
  ).length;

  const customerCancelled = orders.filter((o) => {
    const m = parseOrderMeta(o.internalNotes);
    return o.orderStatus === 'CANCELLED' && m.cancelledByCustomer;
  }).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-ink-400">
            Confirm payment, advance shipment steps, or permanently delete cancelled orders.
            {needsReview > 0 ? ` ${needsReview} payment report(s) waiting.` : ''}
            {customerCancelled > 0 ? ` ${customerCancelled} customer cancel(s).` : ''}
          </p>
        </div>
        <Link href="/admin" className="text-sm text-ink-400 hover:text-white">
          ← Dashboard
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {orders.length === 0 && <p className="text-sm text-ink-500">No orders yet.</p>}
        {orders.map((o) => {
          const meta = parseOrderMeta(o.internalNotes);
          const reported = Boolean(meta.paymentReportedAt);
          const dest = formatDeliveryAddress(meta.deliveryAddress);
          const lastEvent = meta.shipmentEvents?.[meta.shipmentEvents.length - 1];
          const cancelledByCustomer = Boolean(meta.cancelledByCustomer);
          return (
            <div
              key={o.id}
              className={`card p-5 ${o.orderStatus === 'CANCELLED' ? 'border-amber-500/30' : ''}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-white">{o.reference}</p>
                  <p className="mt-1 text-sm text-ink-300">
                    {o.vehicle.modelYear} {o.vehicle.model} · {o.vehicle.trim}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {o.user.fullName} · {o.user.email}
                    {o.user.phone ? ` · ${o.user.phone}` : ''}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    {formatMoney(Number(o.sellingPrice), o.currency)} ·{' '}
                    {o.createdAt.toLocaleString()}
                  </p>
                  {dest && (
                    <p className="mt-2 text-xs text-ink-300">
                      <span className="text-ink-500">Deliver to:</span> {dest}
                    </p>
                  )}
                  {meta.carrierTracking && (
                    <p className="mt-1 font-mono text-xs text-emerald-300">
                      Track: {meta.carrierTracking}
                      {lastEvent ? ` · ${lastEvent.label}` : ''}
                    </p>
                  )}
                  {reported && o.paymentStatus === 'PENDING' && (
                    <p className="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                      Customer reported payment
                    </p>
                  )}
                  {cancelledByCustomer && (
                    <p className="mt-2 inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] font-medium text-red-200">
                      Customer deleted / cancelled
                    </p>
                  )}
                </div>
                <div className="text-right text-xs text-ink-400">
                  <p>Order: {o.orderStatus}</p>
                  <p>Pay: {o.paymentStatus}</p>
                </div>
              </div>
              <AdminOrderActions
                orderId={o.id}
                orderStatus={o.orderStatus}
                paymentStatus={o.paymentStatus}
                carrierTracking={meta.carrierTracking}
                cancelledByCustomer={cancelledByCustomer}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
