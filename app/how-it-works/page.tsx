export default function HowItWorksPage() {
  const steps = [
    {
      t: 'Explore',
      d: 'Browse our Tesla catalog: Model 3, Model Y, Model S, Model X, Cybertruck, Semi, and the latest Roadster lineup.',
    },
    {
      t: 'Compare',
      d: 'Use the comparison tool to evaluate range, acceleration, price, and drive type side by side.',
    },
    {
      t: 'Select',
      d: 'Open a vehicle detail page for galleries, specifications, and current availability.',
    },
    {
      t: 'Order or reserve',
      d: 'Log in, choose a payment plan (25% down, 50% deposit, or full payment), and submit your order with delivery details.',
    },
    {
      t: 'Complete payment',
      d: 'Pay by card, wire transfer, or crypto using the instructions on your confirmation page. Our team verifies every transaction.',
    },
    {
      t: 'Delivery or collection',
      d: 'We coordinate handoff according to your delivery address and schedule once payment is confirmed.',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">How it works</h1>
      <p className="mt-3 text-sm text-ink-400">
        Tesla Motors Marketplace is an affiliate partner of Tesla, Inc. We guide you from browsing
        to delivery with a simple, secure process.
      </p>
      <ol className="mt-10 space-y-6">
        {steps.map((s, i) => (
          <li key={s.t} className="card flex gap-4 p-5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-ink-950">
              {i + 1}
            </span>
            <div>
              <h2 className="font-semibold">{s.t}</h2>
              <p className="mt-1 text-sm text-ink-400">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
