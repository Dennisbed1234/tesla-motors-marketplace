import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';
import { parseOrderMeta } from '@/lib/shipping';
import { LogoutButton } from '@/components/LogoutButton';
import { DeleteOrderButton } from '@/components/DeleteOrderButton';

export const dynamic = 'force-dynamic';

function friendlyStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/account');

  const [reservations, orders, favorites] = await Promise.all([
    prisma.reservation.findMany({
      where: { userId: session.id },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.order.findMany({
      where: {
        userId: session.id,
        orderStatus: { not: 'CANCELLED' },
      },
      include: { vehicle: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.favorite.findMany({
      where: { userId: session.id },
      include: { vehicle: { include: { images: { take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Welcome, {session.fullName}</h1>
          <p className="mt-1 text-sm text-ink-400">{session.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/delivery"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Track &amp; ship
          </Link>
          <LogoutButton />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">My reservations</h2>
        {reservations.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">
            No reservations yet.{' '}
            <Link href="/vehicles" className="underline">
              Browse vehicles
            </Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reservations.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    {r.vehicle.model} {r.vehicle.trim}
                  </p>
                  <p className="text-xs text-ink-400">
                    {r.reference} · {friendlyStatus(r.status)} · deposit{' '}
                    {formatMoney(Number(r.depositAmount))}
                  </p>
                </div>
                <Link href={`/vehicles/${r.vehicle.slug}`} className="text-sm text-ink-300 underline">
                  View
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">My orders</h2>
          <Link href="/delivery" className="text-sm text-ink-400 underline hover:text-white">
            Open tracking
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => {
              const meta = parseOrderMeta(o.internalNotes);
              const track = meta.carrierTracking;
              const delivered =
                o.orderStatus === 'DELIVERED' || o.orderStatus === 'COLLECTED';
              return (
                <li key={o.id} className="card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono font-medium">{o.reference}</p>
                      <p className="mt-1 text-xs text-ink-400">
                        {o.vehicle.model} · {friendlyStatus(o.orderStatus)} ·{' '}
                        {formatMoney(Number(o.sellingPrice))}
                      </p>
                      {track ? (
                        <p className="mt-2 text-xs text-emerald-300">
                          Shipment tracking:{' '}
                          <span className="font-mono font-semibold">{track}</span>
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-ink-500">
                          Tracking number appears after payment is confirmed.
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Link
                        href={`/delivery?order=${encodeURIComponent(o.reference)}`}
                        className="text-xs font-medium text-emerald-300 hover:underline"
                      >
                        Track order →
                      </Link>
                      {track && (
                        <Link
                          href={`/delivery#shipment`}
                          className="text-[11px] text-ink-400 underline"
                        >
                          Track shipment
                        </Link>
                      )}
                      <Link
                        href={`/orders/${encodeURIComponent(o.reference)}/confirmed`}
                        className="text-[11px] text-ink-400 underline"
                      >
                        Order details
                      </Link>
                      <DeleteOrderButton reference={o.reference} disabled={delivered} />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Saved vehicles</h2>
        {favorites.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">No favorites yet.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {favorites.map((f) => (
              <li key={f.id} className="card p-4">
                <Link href={`/vehicles/${f.vehicle.slug}`} className="font-medium hover:underline">
                  {f.vehicle.modelYear} {f.vehicle.model} {f.vehicle.trim}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
