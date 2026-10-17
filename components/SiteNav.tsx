'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';

type SessionInfo = {
  fullName: string;
  role: string;
} | null;

const baseLinks = [
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/compare', label: 'Compare' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
  { href: '/chat', label: 'Chat' },
];

export function SiteNav({ session }: { session: SessionInfo }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // About is for guests only — hide after login
  const links = useMemo(
    () => (session ? baseLinks.filter((l) => l.href !== '/about') : baseLinks),
    [session]
  );

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold tracking-tight text-ink-950">
            TM
          </span>
          <span className="text-sm font-semibold tracking-wide text-white">Tesla Motors</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
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

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              <Link
                href="/account"
                className={`rounded-lg px-3 py-2 text-sm ${
                  isActive('/account') ? 'text-white' : 'text-ink-300 hover:text-white'
                }`}
              >
                Account
              </Link>
              {session.role === 'ADMIN' && (
                <Link href="/admin" className="rounded-lg px-3 py-2 text-sm text-accent-soft hover:text-white">
                  Admin
                </Link>
              )}
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-sm text-ink-400 hover:text-white"
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' });
                  window.location.href = '/';
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-ink-300 hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-2 text-xs">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
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

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-white/10 bg-ink-950 px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-3 py-3 text-sm ${
                  isActive(l.href) ? 'bg-white/10 text-white' : 'text-ink-200'
                }`}
              >
                {l.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-ink-200">
                  Account
                </Link>
                {session.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-accent-soft">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className="rounded-xl px-3 py-3 text-left text-sm text-ink-400"
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/';
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm text-ink-200">
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-2 w-full text-center text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      <p className="border-t border-white/5 bg-ink-900/40 px-4 py-1.5 text-center text-[10px] text-ink-500 sm:text-xs">
        Premium electric vehicle marketplace · New York, NY
      </p>
    </header>
  );
}
