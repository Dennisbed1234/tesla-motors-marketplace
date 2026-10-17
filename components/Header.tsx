import Link from 'next/link';
import { getSession } from '@/lib/auth';

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-ink-950">
            TM
          </span>
          <span className="hidden text-sm font-semibold tracking-wide sm:inline">
            Tesla Motors
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-4">
          <Link href="/vehicles" className="rounded-lg px-2 py-1.5 text-ink-200 hover:text-white">
            Vehicles
          </Link>
          <Link href="/compare" className="hidden rounded-lg px-2 py-1.5 text-ink-200 hover:text-white sm:inline">
            Compare
          </Link>
          <Link href="/how-it-works" className="hidden rounded-lg px-2 py-1.5 text-ink-200 hover:text-white md:inline">
            How it works
          </Link>
          {session ? (
            <>
              <Link href="/account" className="rounded-lg px-2 py-1.5 text-ink-200 hover:text-white">
                Account
              </Link>
              {session.role === 'ADMIN' && (
                <Link href="/admin" className="rounded-lg px-2 py-1.5 text-accent-soft hover:text-white">
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-2 py-1.5 text-ink-200 hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-2 text-xs">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
      <p className="border-t border-white/5 bg-ink-900/50 px-4 py-1 text-center text-[10px] text-ink-400 sm:text-xs">
        Independent marketplace · Not owned or operated by Tesla, Inc.
      </p>
    </header>
  );
}
