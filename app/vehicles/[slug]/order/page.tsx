import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';
import { OrderForm } from '@/components/OrderForm';

export const dynamic = 'force-dynamic';

export default async function OrderVehiclePage({ params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) redirect(`/login?next=/vehicles/${params.slug}/order`);

  const [vehicle, user] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { slug: params.slug },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    }),
    prisma.user.findUnique({ where: { id: session.id } }),
  ]);
  if (!vehicle || !vehicle.published) notFound();

  const price = Number(vehicle.price);
  const full = price;
  const fifty = Math.round(price * 0.5 * 100) / 100;
  const twentyFive = Math.round(price * 0.25 * 100) / 100;
  const imageUrl = vehicle.images[0]?.url || '/images/cybertruck.png';

  const profileAddress = {
    line1: user?.addressLine1 || '',
    line2: user?.addressLine2 || '',
    city: user?.city || '',
    state: user?.stateRegion || '',
    postal: user?.postalCode || '',
    country: user?.country || '',
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href={`/vehicles/${vehicle.slug}`} className="text-sm text-ink-400 hover:text-white">
        ← Back to vehicle
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-ink-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`${vehicle.model} ${vehicle.trim}`}
          className="aspect-[16/9] w-full bg-ink-800 object-cover"
        />
        <div className="p-6">
          <p className="text-xs text-ink-400">{vehicle.modelYear}</p>
          <h1 className="text-2xl font-semibold">
            {vehicle.model}{' '}
            <span className="font-normal text-ink-300">{vehicle.trim}</span>
          </h1>
          <p className="mt-2 text-3xl font-semibold">{formatMoney(price, vehicle.currency)}</p>
          <p className="mt-1 text-xs text-ink-400">
            Minimum down payment: 25% ({formatMoney(twentyFive, vehicle.currency)}).
          </p>
        </div>
      </div>

      {vehicle.inventoryStatus === 'SOLD' || vehicle.inventoryStatus === 'UNAVAILABLE' ? (
        <p className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          This vehicle is not available for a new order.
        </p>
      ) : (
        <OrderForm
          vehicleId={vehicle.id}
          slug={vehicle.slug}
          currency={vehicle.currency}
          full={full}
          fifty={fifty}
          twentyFive={twentyFive}
          profileAddress={profileAddress}
        />
      )}
    </div>
  );
}
