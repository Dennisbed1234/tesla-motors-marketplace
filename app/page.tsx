import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { VehicleCard } from '@/components/VehicleCard';
import { RANGE_DISCLAIMER } from '@/lib/utils';

export const dynamic = 'force-dynamic';

type FeaturedVehicle = Awaited<
  ReturnType<
    typeof prisma.vehicle.findMany<{
      include: { images: true };
    }>
  >
>[number];

export default async function HomePage() {
  let featured: FeaturedVehicle[] = [];
  try {
    featured = await prisma.vehicle.findMany({
      where: { published: true, featured: true },
      include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
      orderBy: { price: 'asc' },
      take: 6,
    });
  } catch {
    featured = [];
  }

  return (
    <>
      <section className="relative min-h-[78vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(11,13,16,0.35), rgba(11,13,16,0.92)), url(https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=2000&q=80)',
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-20 pt-32 sm:px-6 sm:pb-28">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-300">
            Premium electric vehicle marketplace
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Experience the Future of Electric Driving.
          </h1>
          <p className="mt-5 max-w-xl text-base text-ink-200 sm:text-lg">
            Discover premium Tesla electric vehicles and find the right model for your journey.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vehicles" className="btn-primary">
              Explore Vehicles
            </Link>
            <Link href="/compare" className="btn-secondary">
              Compare Models
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Featured vehicles</h2>
            <p className="mt-2 text-sm text-ink-400">
              Sample and catalog listings for demonstration. Confirm live inventory with our team.
            </p>
          </div>
          <Link href="/vehicles" className="hidden text-sm text-ink-300 hover:text-white sm:inline">
            View all →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-ink-400">
            No vehicles in the database yet. Connect PostgreSQL, run migrations, and seed sample data.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => (
              <VehicleCard
                key={v.id}
                slug={v.slug}
                model={v.model}
                trim={v.trim}
                modelYear={v.modelYear}
                price={v.price.toString()}
                currency={v.currency}
                rangeEpa={v.rangeEpa}
                accel060={v.accel060}
                inventoryStatus={v.inventoryStatus}
                condition={v.condition}
                imageUrl={v.images[0]?.url}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-y border-white/10 bg-ink-900/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {[
            { t: 'Transparent listings', d: 'Clear status labels: available, reserved, sold, or catalog-only.' },
            { t: 'Detailed specifications', d: 'Performance, range standards, and trim details where verified.' },
            { t: 'Secure accounts', d: 'Hashed passwords, server-side sessions, and role-based admin access.' },
            { t: 'Reservation workflow', d: 'Server checks availability before any reservation is created.' },
          ].map((item) => (
            <div key={item.t}>
              <h3 className="text-sm font-semibold">{item.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-400">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'Explore available vehicles',
            'Compare specifications and prices',
            'Select a vehicle',
            'Submit a purchase inquiry or reservation',
            'Complete the transaction through the configured process',
            'Arrange delivery or collection',
          ].map((step, i) => (
            <li key={step} className="card flex gap-4 p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink-950">
                {i + 1}
              </span>
              <span className="text-sm text-ink-200">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <p className="rounded-2xl border border-white/10 bg-ink-900/50 p-5 text-xs leading-relaxed text-ink-400">
          {RANGE_DISCLAIMER}
        </p>
      </section>
    </>
  );
}
