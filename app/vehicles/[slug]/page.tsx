import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatMoney, RANGE_DISCLAIMER, SPEC_UNAVAILABLE } from '@/lib/utils';
import { getSession } from '@/lib/auth';
import { FavoriteButton } from '@/components/FavoriteButton';
import { absoluteUrl, getSiteUrl, SITE_NAME } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const v = await prisma.vehicle
    .findUnique({
      where: { slug: params.slug },
      include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
    })
    .catch(() => null);

  if (!v) return { title: 'Vehicle' };

  const title = `${v.modelYear} Tesla ${v.model} ${v.trim}`;
  const descSource =
    v.description?.trim() ||
    `${v.modelYear} Tesla ${v.model} ${v.trim}. Browse specs, pricing, and order options at ${SITE_NAME}.`;
  const description = descSource.slice(0, 155);
  const url = `${getSiteUrl()}/vehicles/${v.slug}`;
  const image = absoluteUrl(v.images[0]?.url) || absoluteUrl('/icon');
  const price = Number(v.price);

  return {
    title,
    description,
    alternates: { canonical: `/vehicles/${v.slug}` },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: SITE_NAME,
      images: image
        ? [{ url: image, alt: title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    other: price > 0
      ? {
          'product:price:amount': String(price),
          'product:price:currency': v.currency || 'USD',
        }
      : undefined,
  };
}

function ProductJsonLd({
  vehicle,
  imageUrl,
  price,
}: {
  vehicle: {
    slug: string;
    model: string;
    trim: string;
    modelYear: number;
    description: string;
    currency: string;
    inventoryStatus: string;
    accel060: string | null;
    topSpeed: string | null;
    rangeEpa: number | null;
  };
  imageUrl?: string;
  price: number;
}) {
  const url = `${getSiteUrl()}/vehicles/${vehicle.slug}`;
  const availability =
    vehicle.inventoryStatus === 'AVAILABLE'
      ? 'https://schema.org/InStock'
      : vehicle.inventoryStatus === 'SOLD'
        ? 'https://schema.org/SoldOut'
        : vehicle.inventoryStatus === 'RESERVED'
          ? 'https://schema.org/LimitedAvailability'
          : 'https://schema.org/PreOrder';

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: `${vehicle.modelYear} Tesla ${vehicle.model} ${vehicle.trim}`,
    brand: { '@type': 'Brand', name: 'Tesla' },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.modelYear),
    description: vehicle.description?.slice(0, 500),
    url,
    image: imageUrl ? [imageUrl] : undefined,
    manufacturer: { '@type': 'Organization', name: 'Tesla, Inc.' },
  };

  if (vehicle.accel060) {
    data.accelerationTime = vehicle.accel060;
  }
  if (vehicle.topSpeed) {
    data.speed = vehicle.topSpeed;
  }
  if (vehicle.rangeEpa) {
    data.mileageFromOdometer = {
      '@type': 'QuantitativeValue',
      value: vehicle.rangeEpa,
      unitCode: 'SMI',
      name: 'Estimated range (mi)',
    };
  }

  if (price > 0) {
    data.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: vehicle.currency || 'USD',
      price: price,
      availability,
      seller: {
        '@type': 'AutoDealer',
        name: SITE_NAME,
        url: getSiteUrl(),
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
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
  const primaryImage = absoluteUrl(vehicle.images[0]?.url);

  const specs: [string, string][] = [
    ['Model year', String(vehicle.modelYear)],
    ['Trim', vehicle.trim],
    ['Category', vehicle.category],
    ['Exterior', vehicle.exteriorColor || SPEC_UNAVAILABLE],
    ['Interior', vehicle.interiorColor || SPEC_UNAVAILABLE],
    ['Drive', vehicle.driveType || SPEC_UNAVAILABLE],
    ['0–60 mph', vehicle.accel060 || SPEC_UNAVAILABLE],
    ['Top speed', vehicle.topSpeed || SPEC_UNAVAILABLE],
    [
      'Range',
      vehicle.rangeEpa
        ? `${vehicle.rangeEpa} mi (${vehicle.rangeStandard || 'est.'})`
        : SPEC_UNAVAILABLE,
    ],
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
      <ProductJsonLd vehicle={vehicle} imageUrl={primaryImage} price={price} />

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
          {price > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              Price excludes tax, title, and registration. Tax depends on where the vehicle is registered.
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
