import Link from 'next/link';
import { getSession } from '@/lib/auth';

export async function Footer() {
  const session = await getSession();

  // Logged-in users stay in the app experience — no guest marketing footer
  if (session) {
    return null;
  }

  return (
    <footer className="border-t border-white/10 bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="text-sm font-semibold">Tesla Motors Marketplace</p>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            Premium catalog for Tesla electric vehicles. Browse, compare, reserve, and order.
            We are an affiliate partner of Tesla, Inc.
          </p>
          <p className="mt-3 text-xs text-ink-400">
            <a href="mailto:info@teslamotors.sale" className="text-white hover:underline">
              info@teslamotors.sale
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-300">Explore</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-400">
            <li><Link href="/vehicles" className="hover:text-white">Available vehicles</Link></li>
            <li><Link href="/compare" className="hover:text-white">Compare models</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-300">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-400">
            <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
            <li><Link href="/register" className="hover:text-white">Register</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ink-300">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-400">
            <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms & conditions</Link></li>
            <li><Link href="/refunds" className="hover:text-white">Refunds & cancellation</Link></li>
            <li><Link href="/delivery" className="hover:text-white">Shipping & delivery</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-ink-500">
        © {new Date().getFullYear()} Tesla Motors Marketplace. Affiliate partner of Tesla, Inc.
        Tesla is a trademark of Tesla, Inc.{' '}
        <a href="mailto:info@teslamotors.sale" className="text-ink-400 hover:text-white">
          info@teslamotors.sale
        </a>
      </div>
    </footer>
  );
}
