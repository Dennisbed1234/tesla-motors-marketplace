export default function HowItWorksPage() {
  const steps = [
    { t: 'Explore', d: 'Browse the catalog of Tesla models and trims. Sample and catalog-only items are labeled clearly.' },
    { t: 'Compare', d: 'Use the comparison tool to evaluate range, acceleration, price, and drive type side by side.' },
    { t: 'Select', d: 'Open a vehicle detail page for galleries, specifications, and availability status.' },
    { t: 'Reserve or inquire', d: 'Log in and request a reservation. The server verifies the vehicle is still AVAILABLE before creating a record.' },
    { t: 'Complete the process', d: 'When payments are configured, deposits can be collected through a payment provider. Otherwise staff handle inquiries manually.' },
    { t: 'Delivery or collection', d: 'Arrange handoff according to the operator’s delivery policy once the order is confirmed.' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">How it works</h1>
      <p className="mt-3 text-sm text-ink-400">
        This marketplace is independent of Tesla, Inc. Reservations never mark a vehicle sold without server-side checks.
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
