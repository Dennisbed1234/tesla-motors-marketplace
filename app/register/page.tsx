'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: fd.get('fullName'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        country: fd.get('country'),
        password: fd.get('password'),
        confirmPassword: fd.get('confirmPassword'),
        acceptTerms: fd.get('acceptTerms') === 'on',
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Registration failed');
      return;
    }
    router.push('/account');
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-ink-400">Customer accounts only. Administrators are provisioned separately.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input id="phone" name="phone" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="country">Country</label>
          <input id="country" name="country" className="input" placeholder="United States" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password (min 8)</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? 'text' : 'password'}
              required
              minLength={8}
              className="input pr-16"
            />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400">
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Confirm password</label>
          <input id="confirmPassword" name="confirmPassword" type={show ? 'text' : 'password'} required minLength={8} className="input" />
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-300">
          <input type="checkbox" name="acceptTerms" required className="mt-1" />
          <span>I accept the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</span>
        </label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating…' : 'Register'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-400">
        Already registered? <Link href="/login" className="text-white underline">Log in</Link>
      </p>
    </div>
  );
}
