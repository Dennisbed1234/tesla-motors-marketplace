'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type SessionInfo = {
  fullName: string;
  role: string;
} | null;

type NavItem = { href: string; label: string; icon: string };

const exploreGuest: NavItem[] = [
  { href: '/about', label: 'About us', icon: 'ⓘ' },
  { href: '/vehicles', label: 'Vehicles', icon: '◆' },
  { href: '/compare', label: 'Compare', icon: '◇' },
  { href: '/how-it-works', label: 'How it works', icon: '↻' },
  { href: '/faq', label: 'FAQ', icon: '?' },
  { href: '/delivery', label: 'Shipping & tracking', icon: '📦' },
  { href: '/terms', label: 'Terms & Conditions', icon: '§' },
  { href: '/privacy', label: 'Privacy Policy', icon: '🔒' },
];

const exploreLoggedIn: NavItem[] = [
  { href: '/vehicles', label: 'Vehicles', icon: '◆' },
  { href: '/compare', label: 'Compare', icon: '◇' },
  { href: '/delivery', label: 'Track & ship', icon: '📦' },
  { href: '/chat', label: 'Chat', icon: '💬' },
  { href: '/account', label: 'Account', icon: '○' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
  { href: '/how-it-works', label: 'How it works', icon: '↻' },
];

export function SiteNav({ session }: { session: SessionInfo }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + '/');
  }

  async function logout() {
    try {
      localStorage.removeItem('tm_chat_thread');
      localStorage.removeItem('tm_chat_thread_guest');
    } catch {
      /* ignore */
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  const explore = session ? exploreLoggedIn : exploreGuest;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold tracking-tight text-ink-950">
            TM
          </span>
          <span className="text-sm font-semibold tracking-wide text-white">Tesla Motors</span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              <Link href="/account" className="text-sm text-ink-300 hover:text-white">
                {session.fullName.split(' ')[0]}
              </Link>
              {session.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm text-accent-soft">
                  Admin
                </Link>
              )}
              <button type="button" onClick={logout} className="text-sm text-ink-400 hover:text-white">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-ink-300 hover:text-white">
                Log in
              </Link>
              <Link href="/register" className="btn-primary !px-4 !py-2 text-xs">
                Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </span>
          </button>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 text-white lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </span>
        </button>
      </div>

      {/* Side drawer — CryptoByt style */}
      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/60"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed right-0 top-0 z-[70] flex h-full w-[min(100%,320px)] flex-col border-l border-white/10 bg-[#0c0e0c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-ink-950">
                  TM
                </span>
                <span className="text-sm font-semibold text-white">Tesla Motors</span>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg text-white"
                aria-label="Close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Explore
              </p>
              <ul className="mt-2 space-y-0.5">
                {explore.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                        isActive(item.href)
                          ? 'bg-white/10 text-white'
                          : 'text-ink-200 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="w-5 text-center text-xs opacity-80">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <p className="mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-500">
                Account
              </p>
              <ul className="mt-2 space-y-0.5">
                {session ? (
                  <>
                    <li>
                      <Link
                        href="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink-200 hover:bg-white/5"
                      >
                        <span className="w-5 text-center text-xs">⚙</span>
                        Settings
                      </Link>
                    </li>
                    {session.role === 'ADMIN' && (
                      <li>
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-accent-soft"
                        >
                          <span className="w-5 text-center text-xs">★</span>
                          Admin
                        </Link>
                      </li>
                    )}
                    <li>
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-ink-400 hover:bg-white/5"
                      >
                        <span className="w-5 text-center text-xs">→</span>
                        Log out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        href="/login"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink-200 hover:bg-white/5"
                      >
                        <span className="w-5 text-center text-xs">○</span>
                        Sign in
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/register"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-ink-200 hover:bg-white/5"
                      >
                        <span className="w-5 text-center text-xs">↗</span>
                        Get started
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            {!session && (
              <div className="border-t border-white/10 p-4">
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-ink-950"
                >
                  Get started
                  <span aria-hidden>↗</span>
                </Link>
              </div>
            )}
          </aside>
        </>
      )}
    </header>
  );
}
