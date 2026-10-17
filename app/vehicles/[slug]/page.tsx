import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatMoney, RANGE_DISCLAIMER, SPEC_UNAVAILABLE } from '@/lib/utils';
import { getSession } from '@/lib/auth';
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
  const canOrder =
    price > 0 &&
    vehicle.inventoryStatus !== 'SOLD' &&
    vehicle.inventoryStatus !== 'UNAVAILABLE';
  const deposit25 = Math.round(price * 0.25 * 100) / 100;

  const specs: [string, string][] = [
    ['Model year', String(vehicle.modelYear)],
    ['Trim', vehicle.trim],
    ['Category', vehicle.category],
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
  if (price > 0) {
    specs.push(['Min. down payment (25%)', formatMoney(deposit25, vehicle.currency)]);
  }

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
          <p className="text-sm text-ink-400">{vehicle.modelYear}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
            {vehicle.model}{' '}
            <span className="font-normal text-ink-300">{vehicle.trim}</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-300">{vehicle.description}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {price > 0 ? (
              <p className="text-3xl font-semibold">{formatMoney(price, vehicle.currency)}</p>
            ) : (
              <p className="text-lg text-ink-400">Contact for pricing</p>
            )}
            {vehicle.inventoryStatus === 'AVAILABLE' && (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-wide text-emerald-200">
                Available
              </span>
            )}
          </div>
          {price > 0 && (
            <p className="mt-2 text-sm text-ink-400">
              From {formatMoney(deposit25, vehicle.currency)} down (25% minimum)
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {canOrder && session ? (
              <Link href={`/vehicles/${vehicle.slug}/order`} className="btn-primary">
                Place order
              </Link>
            ) : canOrder && !session ? (
              <Link href={`/login?next=/vehicles/${vehicle.slug}/order`} className="btn-primary">
                Log in to order
              </Link>
            ) : (
              <Link href="/contact" className="btn-primary">
                Contact us
              </Link>
            )}
            {session && <FavoriteButton vehicleId={vehicle.id} />}
            <Link href="/contact" className="btn-secondary">
              Contact seller
            </Link>
            <Link href={`/compare?a=${vehicle.slug}`} className="btn-secondary">
              Compare
            </Link>
          </div>
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
