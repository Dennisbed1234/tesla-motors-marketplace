import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

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
      where: { userId: session.id },
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
        <LogoutButton />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">My reservations</h2>
        {reservations.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">No reservations yet. <Link href="/vehicles" className="underline">Browse vehicles</Link></p>
        ) : (
          <ul className="mt-4 space-y-3">
            {reservations.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{r.vehicle.model} {r.vehicle.trim}</p>
                  <p className="text-xs text-ink-400">{r.reference} · {r.status} · deposit {formatMoney(Number(r.depositAmount))}</p>
                </div>
                <Link href={`/vehicles/${r.vehicle.slug}`} className="text-sm text-ink-300 underline">View</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">My orders</h2>
        {orders.length === 0 ? (
          <p className="mt-3 text-sm text-ink-400">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="card p-4">
                <p className="font-medium">{o.reference}</p>
                <p className="text-xs text-ink-400">{o.vehicle.model} · {o.orderStatus} · {formatMoney(Number(o.sellingPrice))}</p>
              </li>
            ))}
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
