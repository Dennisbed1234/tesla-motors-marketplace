import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Orders</h1>
          <p className="mt-1 text-sm text-ink-400">
            Confirm payments and move orders through transport. Tracking updates when you change status.
            {needsReview > 0 ? ` ${needsReview} payment report(s) waiting.` : ''}
          </p>
        </div>
        <Link href="/admin" className="text-sm text-ink-400 hover:text-white">
          ← Dashboard
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {orders.length === 0 && (
          <p className="text-sm text-ink-500">No orders yet.</p>
        )}
        {orders.map((o) => {
          let reported = false;
          try {
            const meta = o.internalNotes ? JSON.parse(o.internalNotes) : {};
            reported = Boolean(meta.paymentReportedAt);
          } catch {
            reported = false;
          }
          return (
            <div key={o.id} className="card p-5">
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
                  {reported && o.paymentStatus === 'PENDING' && (
                    <p className="mt-2 inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-medium text-amber-200">
                      Customer reported payment
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
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
