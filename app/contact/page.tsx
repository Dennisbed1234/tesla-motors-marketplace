import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-3 text-sm text-ink-400">
        Reach Tesla Motors Marketplace for sales, orders, and support. We are an affiliate partner of Tesla,
        Inc.
      </p>

      <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-ink-900/50 p-6 text-sm text-ink-300">
        <p>
          <span className="text-ink-500">Email:</span>{' '}
          <a href="mailto:info@teslamotors.sale" className="text-white underline hover:text-ink-100">
            info@teslamotors.sale
          </a>
        </p>
        <p>
          <span className="text-ink-500">Phone:</span>{' '}
          <a href="tel:+13475086807" className="text-white underline hover:text-ink-100">
            (347) 508-6807
          </a>
        </p>
        <p>
          <span className="text-ink-500">Address:</span>{' '}
          <span className="text-ink-100">235 East 42nd Street, New York, NY 10017</span>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/chat" className="btn-primary">
          Message our team
        </Link>
        <a href="mailto:info@teslamotors.sale" className="btn-secondary">
          Email sales
        </a>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-ink-500">
        Typical response time is within minutes during business hours. For order tracking, open your account
        or the Track & ship page after you place an order.
      </p>
    </div>
  );
}
