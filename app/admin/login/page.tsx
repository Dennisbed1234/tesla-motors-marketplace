'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: fd.get('email'),
        password: fd.get('password'),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }
    if (data.user?.role !== 'ADMIN') {
      await fetch('/api/auth/logout', { method: 'POST' });
      setError('This portal is for administrators only.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
        Operations
      </div>
      <h1 className="text-center text-2xl font-semibold">Admin sign in</h1>
      <p className="mt-2 text-center text-sm text-ink-400">
        Staff access only. Customers use the regular login.
      </p>

      <form onSubmit={onSubmit} className="card mt-8 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="email">Admin email</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="username" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? 'text' : 'password'}
              required
              className="input pr-16"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Enter admin'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        <Link href="/login" className="underline hover:text-white">Customer login</Link>
        {' · '}
        <Link href="/" className="underline hover:text-white">Home</Link>
      </p>
    </div>
  );
}
