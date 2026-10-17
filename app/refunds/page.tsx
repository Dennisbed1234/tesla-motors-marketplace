export default function RefundsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">Customer care</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Refunds &amp; cancellation</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-400">
        We want you to feel confident ordering with us. If something does not work out, we offer a
        clear path to a full refund.
      </p>

      <div className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6">
        <p className="text-sm font-semibold text-emerald-100">Complete refunds</p>
        <p className="mt-2 text-sm leading-relaxed text-emerald-50/90">
          Eligible cancellations receive a <strong className="font-semibold">complete refund</strong> of
          amounts you paid toward that order — including deposits and down payments — returned to the
          original payment method whenever possible.
        </p>
      </div>

      <section className="mt-10 space-y-5 text-sm leading-relaxed text-ink-300">
        <div className="card p-5">
          <h2 className="font-semibold text-white">When you can cancel for a full refund</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-400">
            <li>Before the vehicle has left our logistics partner for delivery</li>
            <li>If we cannot fulfill the order due to availability or configuration issues</li>
            <li>If payment was taken in error or duplicated</li>
          </ul>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-white">How to request a refund</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-ink-400">
            <li>Contact us via live chat or call (347) 508-6807 with your order number</li>
            <li>Our team confirms eligibility and starts the refund</li>
            <li>Most card and crypto refunds complete within 5–10 business days after approval</li>
          </ol>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-white">After delivery has started</h2>
          <p className="mt-2 text-ink-400">
            If transport is already underway, we will still work with you in good faith. Depending on
            carrier costs already incurred, we may discuss the fairest resolution — our priority is a
            complete refund whenever the situation allows.
          </p>
        </div>
      </section>

      <p className="mt-10 text-xs text-ink-500">
        Questions? Chat with us anytime or visit 235 East 42nd Street, New York, NY 10017.
      </p>
    </div>
  );
}
