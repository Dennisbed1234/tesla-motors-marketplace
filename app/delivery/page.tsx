import { Suspense } from 'react';
import { OrderTracker } from '@/components/OrderTracker';
import { FedExTracker } from '@/components/FedExTracker';

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">Logistics</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Shipping &amp; delivery</h1>

      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-5 sm:p-6">
        <p className="text-base font-semibold text-white">We deliver worldwide</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          Tesla Motors Marketplace ships and delivers internationally. From the moment you place an
          order to the day your vehicle arrives, track every step with your{' '}
          <strong className="font-semibold text-white">order number</strong>, from start to finish.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-ink-400 sm:grid-cols-2">
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span> Worldwide delivery coverage
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span> Live status by order number
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span> FedEx / carrier tracking when shipped
          </li>
          <li className="flex gap-2">
            <span className="text-emerald-400">✓</span> Delivery or collection options
          </li>
        </ul>
      </div>

      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-ink-400">Loading tracker…</p>}>
          <OrderTracker />
        </Suspense>
      </div>

      <div className="mt-10">
        <FedExTracker />
      </div>

      <section className="mt-12 space-y-6">
        <h2 className="text-lg font-semibold">How worldwide delivery works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              t: 'Order to door, worldwide',
              d: 'We schedule professional transport to the delivery address on your order, wherever you are in the world.',
            },
            {
              t: 'Track with your order number',
              d: 'Enter ORD-… above, or open Track from any order on your account, to see payment, preparation, in-transit, and delivered status.',
            },
            {
              t: 'Carrier updates',
              d: 'When your vehicle is with FedEx or a partner carrier, use the tracking number from your email for shipment-level detail.',
            },
            {
              t: 'Inspection & handover',
              d: 'Inspect on arrival, complete paperwork with our guidance, and take delivery with confidence.',
            },
          ].map((card) => (
            <div key={card.t} className="card p-5">
              <h3 className="text-sm font-semibold text-white">{card.t}</h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-400">{card.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 bg-ink-900/40 p-6 text-sm text-ink-300">
        <h2 className="text-base font-semibold text-white">Need help with a shipment?</h2>
        <p className="mt-2 text-sm text-ink-400">
          Call{' '}
          <a href="tel:+13475086807" className="text-white underline">
            (347) 508-6807
          </a>{' '}
          or use live chat. Have your <strong className="text-white">order number</strong> ready.
        </p>
        <p className="mt-3 text-xs text-ink-500">
          Office: 235 East 42nd Street, New York, NY 10017. Worldwide delivery. Affiliate partner of
          Tesla, Inc.
        </p>
      </section>
    </div>
  );
}
