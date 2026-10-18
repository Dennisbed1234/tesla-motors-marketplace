export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-ink-500">Legal</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Terms and conditions</h1>
      <p className="mt-3 text-sm text-ink-400">
        These terms are written to be clear and fair. If anything is unclear, just ask. We are happy
        to explain.
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-300">
        <section className="card p-5">
          <h2 className="font-semibold text-white">Who we are</h2>
          <p className="mt-2 text-ink-400">
            Tesla Motors Marketplace is an affiliate partner of Tesla, Inc. We help you browse,
            compare, reserve, and purchase Tesla vehicles. Product names and trademarks belong to
            their owners. Your order is handled by our New York team.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-white">Your account</h2>
          <p className="mt-2 text-ink-400">
            Please keep your contact details up to date so we can reach you about orders and delivery.
            You are responsible for safeguarding your login. If you suspect unauthorized access, tell
            us right away and we will help secure the account.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-white">Orders and payment</h2>
          <p className="mt-2 text-ink-400">
            When you place an order you choose a payment plan: full payment, 50% deposit, or 25%
            down payment. Remaining balances, if any, are due before delivery as shown on your
            confirmation. We verify payments carefully so your vehicle can move forward without delays.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-white">Pricing and availability</h2>
          <p className="mt-2 text-ink-400">
            Prices and specifications reflect the listing you selected. If something changes before
            we confirm your order, we will contact you with options, including canceling for a
            complete refund if you prefer not to proceed.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-white">Refunds</h2>
          <p className="mt-2 text-ink-400">
            We offer complete refunds on eligible cancellations. Full details are on our{' '}
            <a href="/refunds" className="text-white underline">
              Refunds &amp; cancellation
            </a>{' '}
            page.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-white">Delivery</h2>
          <p className="mt-2 text-ink-400">
            Delivery is arranged after payment confirmation. Tracking (including FedEx when applicable)
            is shared with you. See{' '}
            <a href="/delivery" className="text-white underline">
              Shipping &amp; delivery
            </a>{' '}
            for timelines and how to track your shipment.
          </p>
        </section>

        <section className="card p-5">
          <h2 className="font-semibold text-white">Talk to us</h2>
          <p className="mt-2 text-ink-400">
            Phone:{' '}
            <a href="tel:+13475086807" className="text-white underline">
              (347) 508-6807
            </a>
            <br />
            Live chat on this website
            <br />
            235 East 42nd Street, New York, NY 10017
          </p>
        </section>
      </div>
    </div>
  );
}
