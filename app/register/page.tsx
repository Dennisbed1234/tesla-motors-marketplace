'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';
import { COUNTRIES } from '@/lib/countries';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [country, setCountry] = useState('United States');

  const dial = useMemo(() => {
    const row = COUNTRIES.find((c) => c.name === country);
    return row?.dial || '+1';
  }, [country]);

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
        country: fd.get('country'),
        phoneCountryCode: fd.get('phoneCountryCode'),
        phone: fd.get('phone'),
        addressLine1: fd.get('addressLine1'),
        addressLine2: fd.get('addressLine2'),
        city: fd.get('city'),
        stateRegion: fd.get('stateRegion'),
        postalCode: fd.get('postalCode'),
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
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-ink-400">
        Choose your country from the list. Phone must include the correct country code.
      </p>
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
          <label className="label" htmlFor="country">Country</label>
          <p className="mb-1 text-xs text-ink-500">Select your country from the dropdown (example: United States).</p>
          <select
            id="country"
            name="country"
            required
            className="input"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[110px_1fr] gap-3">
          <div>
            <label className="label" htmlFor="phoneCountryCode">Code</label>
            <input
              id="phoneCountryCode"
              name="phoneCountryCode"
              className="input"
              value={dial}
              readOnly
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone number</label>
            <input
              id="phone"
              name="phone"
              required
              className="input"
              inputMode="tel"
              placeholder="555 123 4567"
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="addressLine1">Street address</label>
          <input id="addressLine1" name="addressLine1" required className="input" placeholder="123 Main St" />
        </div>
        <div>
          <label className="label" htmlFor="addressLine2">Apt / suite (optional)</label>
          <input id="addressLine2" name="addressLine2" className="input" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="label" htmlFor="city">City</label>
            <input id="city" name="city" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="stateRegion">State / region</label>
            <input id="stateRegion" name="stateRegion" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="postalCode">ZIP / postal</label>
            <input id="postalCode" name="postalCode" required className="input" />
          </div>
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
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-400"
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={show ? 'text' : 'password'}
            required
            minLength={8}
            className="input"
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-ink-300">
          <input type="checkbox" name="acceptTerms" required className="mt-1" />
          <span>
            I accept the <Link href="/terms" className="underline">Terms</Link> and{' '}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </span>
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
