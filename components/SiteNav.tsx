'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

type SessionInfo = {
  fullName: string;
  role: string;
} | null;

const guestLinks = [
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/compare', label: 'Compare' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/chat', label: 'Chat' },
];

export function SiteNav({ session }: { session: SessionInfo }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const dashLinks = useMemo(() => {
    const items = [
      { href: '/vehicles', label: 'Vehicles' },
      { href: '/account', label: 'Account' },
      { href: '/delivery', label: 'Track & ship' },
      { href: '/chat', label: 'Chat' },
      { href: '/compare', label: 'Compare' },
    ];
    if (session?.role === 'ADMIN') {
      items.push({ href: '/admin', label: 'Admin' });
    }
    return items;
  }, [session?.role]);

  function isActive(href: string) {
    if (href === '/delivery') {
      return pathname === '/delivery' || pathname.startsWith('/delivery');
    }
    return pathname === href || pathname.startsWith(href + '/');
  }

  // Logged-in: horizontal dashboard strip (CryptoByt-style) — does not push page content
  if (session) {
    return (
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold tracking-tight text-ink-950">
              TM
            </span>
            <span className="hidden text-sm font-semibold tracking-wide text-white sm:inline">
              Tesla Motors
            </span>
          </Link>

          <nav
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {dashLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition sm:text-sm ${
                  isActive(l.href)
                    ? 'bg-white text-ink-950'
                    : 'text-ink-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs text-ink-400 hover:text-white"
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/';
            }}
          >
            Log out
          </button>
        </div>
      </header>
    );
  }

  // Guest: logo + horizontal links on desktop; compact sheet on mobile (overlay, not layout push)
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold tracking-tight text-ink-950">
            TM
          </span>
          <span className="text-sm font-semibold tracking-wide text-white">Tesla Motors</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {guestLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                isActive(l.href) ? 'bg-white/10 text-white' : 'text-ink-300 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:text-white">
            Log in
          </Link>
          <Link href="/register" className="btn-primary !px-4 !py-2 text-xs">
            Sign up
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <span className="text-lg leading-none">×</span>
          ) : (
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </span>
          )}
        </button>
      </div>

      {/* Overlay menu — fixed, does not push page content down */}
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-white/10 bg-ink-950 px-4 py-3 shadow-xl md:hidden">
            <nav className="flex flex-wrap gap-2">
              {guestLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-full px-3.5 py-2 text-sm ${
                    isActive(l.href) ? 'bg-white text-ink-950' : 'bg-white/5 text-ink-200'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/5 px-3.5 py-2 text-sm text-ink-200"
              >
                Log in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white px-3.5 py-2 text-sm font-medium text-ink-950"
              >
                Sign up
              </Link>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
