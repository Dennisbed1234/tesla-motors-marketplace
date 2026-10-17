import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatMoney, RANGE_DISCLAIMER, SPEC_UNAVAILABLE } from '@/lib/utils';
import { getSession } from '@/lib/auth';
import { ReserveButton } from '@/components/ReserveButton';
import { FavoriteButton } from '@/components/FavoriteButton';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const v = await prisma.vehicle.findUnique({ where: { slug: params.slug } }).catch(() => null);
  if (!v) return { title: 'Vehicle' };
  return {
    title: `${v.modelYear} Tesla ${v.model} ${v.trim}`,
    description: v.description.slice(0, 155),
  };
}

export default async function VehicleDetailPage({ params }: { params: { slug: string } }) {
  const vehicle = await prisma.vehicle
    .findUnique({
      where: { slug: params.slug },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    })
    .catch(() => null);

  if (!vehicle || !vehicle.published) notFound();

  const session = await getSession();
  const price = Number(vehicle.price);
  const canReserve =
    vehicle.inventoryStatus === 'AVAILABLE' && vehicle.condition !== 'SAMPLE'
      ? true
      : vehicle.inventoryStatus === 'AVAILABLE';

  const specs: [string, string][] = [
    ['Model year', String(vehicle.modelYear)],
    ['Trim', vehicle.trim],
    ['Category', vehicle.category],
    ['Condition', vehicle.condition],
    ['Status', vehicle.inventoryStatus],
    ['Exterior', vehicle.exteriorColor || SPEC_UNAVAILABLE],
    ['Interior', vehicle.interiorColor || SPEC_UNAVAILABLE],
    ['Drive', vehicle.driveType || SPEC_UNAVAILABLE],
    ['0–60 mph', vehicle.accel060 || SPEC_UNAVAILABLE],
    ['Top speed', vehicle.topSpeed || SPEC_UNAVAILABLE],
    ['Range', vehicle.rangeEpa ? `${vehicle.rangeEpa} mi (${vehicle.rangeStandard || 'est.'})` : SPEC_UNAVAILABLE],
    ['Battery', vehicle.batteryKwh ? `${vehicle.batteryKwh} kWh` : SPEC_UNAVAILABLE],
    ['Seating', vehicle.seating ? String(vehicle.seating) : SPEC_UNAVAILABLE],
    ['Horsepower', vehicle.horsepower || SPEC_UNAVAILABLE],
    ['Torque', vehicle.torque || SPEC_UNAVAILABLE],
    ['Charging', vehicle.charging || SPEC_UNAVAILABLE],
    ['Safety', vehicle.safetyRating || SPEC_UNAVAILABLE],
    ['Market', vehicle.market],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-ink-800">
            {vehicle.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vehicle.images[0].url}
                alt={vehicle.images[0].altText}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-ink-500">Image unavailable</div>
            )}
          </div>
          {vehicle.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {vehicle.images.map((img) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.altText}
                  className="h-20 w-28 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-ink-400">{vehicle.modelYear} · {vehicle.category}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            {vehicle.model}{' '}
            <span className="font-normal text-ink-300">{vehicle.trim}</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-300">{vehicle.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {price > 0 ? (
              <p className="text-3xl font-semibold">{formatMoney(price, vehicle.currency)}</p>
            ) : (
              <p className="text-lg text-ink-400">Catalog reference — not priced for sale</p>
            )}
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wide">
              {vehicle.inventoryStatus.replace('_', ' ')}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {canReserve && session ? (
              <ReserveButton vehicleId={vehicle.id} />
            ) : canReserve && !session ? (
              <Link href={`/login?next=/vehicles/${vehicle.slug}`} className="btn-primary">
                Log in to reserve
              </Link>
            ) : (
              <button className="btn-primary opacity-50" disabled>
                Not available to reserve
              </button>
            )}
            {session && <FavoriteButton vehicleId={vehicle.id} />}
            <Link href="/contact" className="btn-secondary">
              Contact seller
            </Link>
            <Link href={`/compare?a=${vehicle.slug}`} className="btn-secondary">
              Compare
            </Link>
          </div>

          {vehicle.disclaimer && (
            <p className="mt-6 text-xs leading-relaxed text-amber-200/80">{vehicle.disclaimer}</p>
          )}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold">Specifications</h2>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {specs.map(([k, val]) => (
            <div key={k} className="rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">
              <dt className="text-[11px] uppercase tracking-wider text-ink-500">{k}</dt>
              <dd className="mt-1 text-sm text-ink-100">{val}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-xs leading-relaxed text-ink-500">{RANGE_DISCLAIMER}</p>
      </section>
    </div>
  );
}
