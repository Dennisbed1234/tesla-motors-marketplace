export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">About us</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-300">
        <p>
          Tesla Motors Marketplace is a premium electric vehicle marketplace and an affiliate partner
          of Tesla, Inc. We specialize in helping customers discover, compare, reserve, and purchase
          Tesla models with clear pricing and dedicated support.
        </p>
        <p>
          Our New York team manages listings, orders, payment verification, and delivery coordination.
          You get the Tesla product line you expect — with a guided buying experience through our
          affiliate marketplace.
        </p>
        <p>
          Nothing has changed about the vehicles themselves. Model names, performance figures, and
          product families remain Tesla’s. We simply make ordering and support easier from one place.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-ink-900/50 p-6 text-sm">
        <h2 className="text-base font-semibold text-white">Contact</h2>
        <dl className="mt-4 space-y-3 text-ink-300">
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-500">Phone</dt>
            <dd className="mt-1">
              <a href="tel:+13475086807" className="text-white hover:underline">
                (347) 508-6807
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-ink-500">Address</dt>
            <dd className="mt-1">
              235 East 42nd Street
              <br />
              New York, NY 10017
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
