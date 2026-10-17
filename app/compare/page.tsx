import { prisma } from '@/lib/prisma';
import { formatMoney, SPEC_UNAVAILABLE } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { a?: string; b?: string; c?: string };
}) {
  const slugs = [searchParams.a, searchParams.b, searchParams.c].filter(Boolean) as string[];

  const all = await prisma.vehicle
    .findMany({
      where: { published: true, category: 'PASSENGER' },
      orderBy: [{ model: 'asc' }, { price: 'asc' }],
      select: { slug: true, model: true, trim: true, modelYear: true },
    })
    .catch(() => []);

  const selected = slugs.length
    ? await prisma.vehicle.findMany({
        where: { slug: { in: slugs } },
        include: { images: { take: 1 } },
      }).catch(() => [])
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Compare models</h1>
      <p className="mt-2 text-sm text-ink-400">Select up to three passenger vehicles to compare side by side.</p>

      <form className="mt-8 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <select key={i} name={['a', 'b', 'c'][i]} defaultValue={slugs[i] || ''} className="input">
            <option value="">Select vehicle {i + 1}</option>
            {all.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.modelYear} {v.model} {v.trim}
              </option>
            ))}
          </select>
        ))}
        <button type="submit" className="btn-primary sm:col-span-3 sm:w-fit">Compare</button>
      </form>

      {selected.length > 0 && (
        <div className="mt-10 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-ink-400">
                <th className="py-3 pr-4">Spec</th>
                {selected.map((v) => (
                  <th key={v.id} className="py-3 pr-4">
                    <Link href={`/vehicles/${v.slug}`} className="text-white hover:underline">
                      {v.model} {v.trim}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-ink-200">
              {(
                [
                  ['Year', (v: (typeof selected)[0]) => String(v.modelYear)],
                  ['Price', (v: (typeof selected)[0]) => formatMoney(Number(v.price))],
                  ['Drive', (v: (typeof selected)[0]) => v.driveType || SPEC_UNAVAILABLE],
                  ['0–60', (v: (typeof selected)[0]) => v.accel060 || SPEC_UNAVAILABLE],
                  ['Range (EPA)', (v: (typeof selected)[0]) => (v.rangeEpa ? `${v.rangeEpa} mi` : SPEC_UNAVAILABLE)],
                  ['Seats', (v: (typeof selected)[0]) => (v.seating ? String(v.seating) : SPEC_UNAVAILABLE)],
                  ['Status', (v: (typeof selected)[0]) => v.inventoryStatus],
                ] as const
              ).map(([label, fn]) => (
                <tr key={label} className="border-b border-white/5">
                  <td className="py-3 pr-4 text-ink-500">{label}</td>
                  {selected.map((v) => (
                    <td key={v.id + label} className="py-3 pr-4">{fn(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
