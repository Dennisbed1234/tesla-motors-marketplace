import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatMoney } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminVehiclesPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/admin/vehicles');
  if (session.role !== 'ADMIN') redirect('/account');

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { images: { take: 1 } },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Vehicle inventory</h1>
        <Link href="/admin" className="text-sm text-ink-400 hover:text-white">← Dashboard</Link>
      </div>
      <p className="mt-2 text-sm text-ink-400">
        Edit inventory in the database or extend this UI with create/edit forms. Status changes affect the public site immediately.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-ink-900 text-xs uppercase text-ink-400">
            <tr>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-t border-white/10">
                <td className="px-4 py-3">{v.model} {v.trim}</td>
                <td className="px-4 py-3">{v.modelYear}</td>
                <td className="px-4 py-3">{formatMoney(Number(v.price))}</td>
                <td className="px-4 py-3">{v.inventoryStatus}</td>
                <td className="px-4 py-3">{v.featured ? 'Yes' : 'No'}</td>
                <td className="px-4 py-3">
                  <Link href={`/vehicles/${v.slug}`} className="text-xs underline">Public page</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
