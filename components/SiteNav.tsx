'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type SessionInfo = {
  fullName: string;
  role: string;
} | null;

type NavItem = { href: string; label: string };

const exploreGuest: NavItem[] = [
  { href: '/about', label: 'About us' },
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/compare', label: 'Compare' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/delivery', label: 'Shipping & tracking' },
  { href: '/chat', label: 'Chat' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
];

const exploreLoggedIn: NavItem[] = [
  { href: '/vehicles', label: 'Vehicles' },
  { href: '/compare', label: 'Compare' },
  { href: '/delivery', label: 'Track & ship' },
  { href: '/chat', label: 'Chat' },
  { href: '/account', label: 'Account' },
  { href: '/settings', label: 'Settings' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
];

export function SiteNav({ session }: { session: SessionInfo }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const drawer =
    open && mounted
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[200] bg-black/70"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <aside
              className="fixed right-0 top-0 z-[210] flex h-[100dvh] w-[min(100vw,20rem)] flex-col bg-[#111111] text-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Main menu"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/15 px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-bold text-black">
                    TM
                  </span>
                  <span className="text-sm font-semibold text-white">Tesla Motors</span>
                </div>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl leading-none text-white"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                >
                  ×
                </button>
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-4">
                <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Explore
                </p>
                <ul className="space-y-1">
                  {explore.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`block rounded-xl px-3 py-3.5 text-[15px] font-medium ${
                          isActive(item.href)
                            ? 'bg-white text-black'
                            : 'text-neutral-100 hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-400">
                  Account
                </p>
                <ul className="space-y-1">
                  {session ? (
                    <>
                      <li>
                        <Link
                          href="/settings"
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-3 py-3.5 text-[15px] font-medium text-neutral-100 hover:bg-white/10"
                        >
                          Settings
                        </Link>
                      </li>
                      {session.role === 'ADMIN' && (
                        <li>
                          <Link
                            href="/admin"
                            onClick={() => setOpen(false)}
                            className="block rounded-xl px-3 py-3.5 text-[15px] font-medium text-neutral-100 hover:bg-white/10"
                          >
                            Admin
                          </Link>
                        </li>
                      )}
                      <li>
                        <button
                          type="button"
                          onClick={logout}
                          className="block w-full rounded-xl px-3 py-3.5 text-left text-[15px] font-medium text-neutral-400 hover:bg-white/10 hover:text-white"
                        >
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
                          className="block rounded-xl px-3 py-3.5 text-[15px] font-medium text-neutral-100 hover:bg-white/10"
                        >
                          Sign in
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/register"
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-3 py-3.5 text-[15px] font-medium text-neutral-100 hover:bg-white/10"
                        >
                          Get started
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </nav>

              {!session && (
                <div className="shrink-0 border-t border-white/15 p-4">
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex w-full items-center justify-center rounded-full bg-white py-3.5 text-sm font-semibold text-black"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </aside>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-950/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-xs font-bold tracking-tight text-ink-950">
              TM
            </span>
            <span className="text-sm font-semibold tracking-wide text-white">Tesla Motors</span>
          </Link>

          <div className="flex items-center gap-2">
            {session ? (
              <Link
                href="/account"
                className="hidden text-sm text-neutral-300 hover:text-white sm:inline"
              >
                {session.fullName.split(' ')[0]}
              </Link>
            ) : (
              <Link href="/login" className="hidden text-sm text-neutral-300 hover:text-white sm:inline">
                Log in
              </Link>
            )}
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
              </span>
            </button>
          </div>
        </div>
      </header>
      {drawer}
    </>
  );
}
