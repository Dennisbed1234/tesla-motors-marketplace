import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';
import { LogoutButton } from '@/components/LogoutButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/admin');
  if (session.role !== 'ADMIN') redirect('/account');

  const [
    vehicleCount,
    available,
    reserved,
    sold,
    customers,
    pendingReservations,
    recentReservations,
    recentUsers,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { inventoryStatus: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { inventoryStatus: 'RESERVED' } }),
    prisma.vehicle.count({ where: { inventoryStatus: 'SOLD' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.reservation.count({ where: { status: 'PENDING' } }),
    prisma.reservation.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true, vehicle: true },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true, status: true },
    }),
  ]);

  const cards = [
    { label: 'Vehicles', value: vehicleCount },
    { label: 'Available', value: available },
    { label: 'Reserved', value: reserved },
    { label: 'Sold', value: sold },
    { label: 'Customers', value: customers },
    { label: 'Pending reservations', value: pendingReservations },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="text-sm text-ink-400">Signed in as {session.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/vehicles" className="btn-secondary !py-2 text-xs">Manage vehicles</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs uppercase tracking-wider text-ink-500">{c.label}</p>
            <p className="mt-2 text-3xl font-semibold">{c.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Recent reservations</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-ink-900 text-xs uppercase text-ink-400">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Deposit</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((r) => (
                <tr key={r.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
                  <td className="px-4 py-3">{r.user.email}</td>
                  <td className="px-4 py-3">{r.vehicle.model} {r.vehicle.trim}</td>
                  <td className="px-4 py-3">{formatMoney(Number(r.depositAmount))}</td>
                  <td className="px-4 py-3">{r.status}</td>
                </tr>
              ))}
              {recentReservations.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-6 text-ink-500">No reservations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">Recent customers</h2>
        <ul className="mt-4 space-y-2">
          {recentUsers.map((u) => (
            <li key={u.id} className="card flex justify-between p-4 text-sm">
              <span>{u.fullName} · {u.email}</span>
              <span className="text-ink-400">{u.role} · {u.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
