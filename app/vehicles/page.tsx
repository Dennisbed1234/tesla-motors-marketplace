import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { VehicleCard } from '@/components/VehicleCard';
import { Prisma } from '@prisma/client';
import { getSiteUrl } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tesla vehicles for sale',
  description:
    'Browse available Tesla Model 3, Model Y, Model S, Model X, Cybertruck, and Roadster listings. Compare specs, check availability, and place an order.',
  alternates: { canonical: '/vehicles' },
  openGraph: {
    title: 'Tesla vehicles for sale | Tesla Motors',
    description:
      'Browse Tesla electric vehicles including Roadster, Cybertruck, and Model lineup. Clear pricing and reservation options.',
    url: `${getSiteUrl()}/vehicles`,
    type: 'website',
  },
};

type SearchParams = {
  q?: string;
  model?: string;
  year?: string;
  status?: string;
  drive?: string;
  sort?: string;
  min?: string;
  max?: string;
};

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const where: Prisma.VehicleWhereInput = { published: true };

  if (searchParams.q) {
    where.OR = [
      { model: { contains: searchParams.q, mode: 'insensitive' } },
      { trim: { contains: searchParams.q, mode: 'insensitive' } },
      { description: { contains: searchParams.q, mode: 'insensitive' } },
    ];
  }
  if (searchParams.model) where.model = searchParams.model;
  if (searchParams.year) where.modelYear = Number(searchParams.year);
  if (searchParams.status) where.inventoryStatus = searchParams.status as never;
  if (searchParams.drive) where.driveType = { contains: searchParams.drive, mode: 'insensitive' };
  if (searchParams.min || searchParams.max) {
    where.price = {};
    if (searchParams.min) where.price.gte = Number(searchParams.min);
    if (searchParams.max) where.price.lte = Number(searchParams.max);
  }

  let orderBy: Prisma.VehicleOrderByWithRelationInput = { createdAt: 'desc' };
  if (searchParams.sort === 'price-asc') orderBy = { price: 'asc' };
  if (searchParams.sort === 'price-desc') orderBy = { price: 'desc' };
  if (searchParams.sort === 'newest') orderBy = { modelYear: 'desc' };

  const vehicles = await prisma.vehicle
    .findMany({
      where,
      include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
      orderBy,
    })
    .catch(() => []);

  const models = ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Semi', 'Roadster'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Vehicles</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink-400">
        Filter by model, year, price, and availability.
      </p>

      <form className="mt-8 grid gap-3 rounded-2xl border border-white/10 bg-ink-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input name="q" defaultValue={searchParams.q} placeholder="Search name or trim" className="input" />
        <select name="model" defaultValue={searchParams.model || ''} className="input">
          <option value="">All models</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={searchParams.status || ''} className="input">
          <option value="">Any status</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="CATALOG_ONLY">Catalog only</option>
          <option value="SOLD">Sold</option>
        </select>
        <select name="sort" defaultValue={searchParams.sort || ''} className="input">
          <option value="">Recently added</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="newest">Newest model year</option>
        </select>
        <input name="min" type="number" defaultValue={searchParams.min} placeholder="Min price" className="input" />
        <input name="max" type="number" defaultValue={searchParams.max} placeholder="Max price" className="input" />
        <input name="year" type="number" defaultValue={searchParams.year} placeholder="Year" className="input" />
        <button type="submit" className="btn-primary">
          Apply filters
        </button>
      </form>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <VehicleCard
            key={v.id}
            slug={v.slug}
            model={v.model}
            trim={v.trim}
            modelYear={v.modelYear}
            price={Number(v.price)}
            currency={v.currency}
            inventoryStatus={v.inventoryStatus}
            condition={v.condition}
            imageUrl={v.images[0]?.url}
          />
        ))}
      </div>

      {vehicles.length === 0 && (
        <p className="mt-12 text-center text-sm text-ink-400">No vehicles match these filters.</p>
      )}
    </div>
  );
}
