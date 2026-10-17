import { FedExTracker } from '@/components/FedExTracker';

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">Logistics</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Shipping &amp; delivery</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-400">
        After your order is confirmed, we arrange professional transport to the delivery address you
        provided — or schedule collection. Most vehicle shipments use FedEx Freight or an approved
        transport partner, and you receive a tracking number by email and in your account.
      </p>

      <div className="mt-10">
        <FedExTracker />
      </div>

      <section className="mt-12 space-y-6">
        <h2 className="text-lg font-semibold">How delivery works</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              t: 'Nationwide coverage',
              d: 'We deliver across the United States. International requests are reviewed case by case.',
            },
            {
              t: 'Enclosed transport preferred',
              d: 'Whenever possible we use enclosed carriers to protect exterior finish during transit.',
            },
            {
              t: 'Inspection on arrival',
              d: 'You may inspect the vehicle at delivery. Note any concerns with the driver before signing.',
            },
            {
              t: 'Title & paperwork',
              d: 'Our team coordinates title transfer and registration guidance for your state.',
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
          or use live chat. Have your order number and FedEx tracking number ready.
        </p>
        <p className="mt-3 text-xs text-ink-500">
          Office: 235 East 42nd Street, New York, NY 10017 · Affiliate partner of Tesla, Inc.
        </p>
      </section>
    </div>
  );
}
