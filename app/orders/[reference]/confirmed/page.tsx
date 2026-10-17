import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { formatMoney } from '@/lib/utils';
import { DEFAULT_PAYMENT_METHODS, PAYMENT_METHODS_KEY, type PaymentMethodsConfig } from '@/lib/payments';
import { PaymentInstructions } from '@/components/PaymentInstructions';

export const dynamic = 'force-dynamic';

export default async function OrderConfirmedPage({
  params,
  searchParams,
}: {
  params: { reference: string };
  searchParams?: { method?: string };
}) {
  const session = await getSession();
  if (!session) redirect('/login');

  const order = await prisma.order.findUnique({
    where: { reference: params.reference },
    include: {
      vehicle: { include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } } },
      user: true,
    },
  });

  if (!order || order.userId !== session.id) notFound();

  let planMeta: {
    paymentPlan?: string;
    amountDue?: number;
    planLabel?: string;
    paymentMethod?: string;
  } = {};
  try {
    planMeta = order.internalNotes ? JSON.parse(order.internalNotes) : {};
  } catch {
    planMeta = {};
  }

  let payConfig: PaymentMethodsConfig = DEFAULT_PAYMENT_METHODS;
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: PAYMENT_METHODS_KEY } });
    if (row?.body) payConfig = { ...DEFAULT_PAYMENT_METHODS, ...JSON.parse(row.body) };
  } catch {
    payConfig = DEFAULT_PAYMENT_METHODS;
  }

  const preferredMethod =
    searchParams?.method || planMeta.paymentMethod || null;

  const price = Number(order.sellingPrice);
  const amountDue = planMeta.amountDue ?? price * 0.25;
  const imageUrl =
    order.vehicle.images[0]?.url ||
    (order.vehicle.model === 'Cybertruck'
      ? '/images/cybertruck.png'
      : '/images/roadster.png');

  return (
    <div className="min-h-[80vh] bg-white text-ink-950">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight">Thank You</h1>
        <p className="mt-2 text-center text-ink-600">
          Your {order.vehicle.model} Order is Confirmed
        </p>

        <div className="mt-10 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${order.vehicle.model} ${order.vehicle.trim}`}
            className="max-h-56 w-auto object-contain"
          />
        </div>

        <div className="mt-12 grid gap-8 border-t border-ink-100 pt-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Your {order.vehicle.model}
            </p>
            <p className="mt-2 text-2xl font-semibold">{order.vehicle.trim}</p>
            <p className="mt-2 text-sm text-ink-600">{order.vehicle.description.slice(0, 160)}</p>
            <Link
              href={`/vehicles/${order.vehicle.slug}`}
              className="mt-3 inline-block text-sm text-ink-950 underline"
            >
              Learn More
            </Link>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Order number</p>
              <p className="mt-1 font-mono text-base">{order.reference}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Vehicle price</p>
              <p className="mt-1 text-base">{formatMoney(price, order.currency)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Payment selected</p>
              <p className="mt-1 text-base">
                {planMeta.planLabel || 'Down payment'} ·{' '}
                <span className="font-semibold">{formatMoney(amountDue, order.currency)}</span>
              </p>
              <p className="mt-1 text-xs text-ink-500">
                Status: {order.paymentStatus} · {order.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">Next payment</p>
              <p className="mt-1 text-base">
                {planMeta.paymentPlan === 'FULL'
                  ? 'None — full amount selected'
                  : formatMoney(price - amountDue, order.currency) + ' before delivery'}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-100 pt-2">
          <PaymentInstructions
            config={payConfig}
            amountLabel={formatMoney(amountDue, order.currency)}
            preferredMethod={preferredMethod}
          />
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 border-t border-ink-100 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-ink-500">
            Include your order number ({order.reference}) with any transfer.
          </p>
          <Link
            href="/account"
            className="rounded-full border border-ink-300 px-5 py-2 text-sm font-medium text-ink-950 hover:bg-ink-50"
          >
            View in Account
          </Link>
        </div>
      </div>
    </div>
  );
}
