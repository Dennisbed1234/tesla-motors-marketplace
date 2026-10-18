'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<'password' | 'code'>('password');
  const [email, setEmail] = useState('');
  const [hint, setHint] = useState('');
  const [devCode, setDevCode] = useState('');

  async function onPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const em = String(fd.get('email') || '').trim();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: em,
        password: fd.get('password'),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Login failed');
      return;
    }
    setEmail(data.email || em);
    setHint(data.message || 'Check your email for a code.');
    if (data.devCode) setDevCode(data.devCode);
    setStep('code');
  }

  async function onCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/verify-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code: fd.get('code'),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || 'Invalid code');
      return;
    }
    try {
      localStorage.removeItem('tm_chat_thread_guest');
    } catch {
      /* ignore */
    }
    router.push(data.user?.role === 'ADMIN' ? '/admin' : next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-semibold">Log in</h1>
      <p className="mt-2 text-sm text-ink-400">
        {step === 'password'
          ? 'Access your account. We will email a one-time code to finish sign-in.'
          : 'Enter the 6-digit code we sent to your email.'}
      </p>

      {step === 'password' ? (
        <form onSubmit={onPassword} className="mt-8 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required className="input" autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
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
            {loading ? 'Checking…' : 'Continue'}
          </button>
        </form>
      ) : (
        <form onSubmit={onCode} className="mt-8 space-y-4">
          <p className="text-sm text-ink-300">{hint}</p>
          <p className="text-xs text-ink-500">Code sent to {email}</p>
          {devCode && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Dev mode (no email provider): code is <strong className="font-mono">{devCode}</strong>
            </p>
          )}
          <div>
            <label className="label" htmlFor="code">
              Verification code
            </label>
            <input
              id="code"
              name="code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              required
              className="input font-mono tracking-[0.3em]"
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying…' : 'Verify & log in'}
          </button>
          <button
            type="button"
            className="w-full text-center text-sm text-ink-400 underline"
            onClick={() => {
              setStep('password');
              setError('');
              setDevCode('');
            }}
          >
            Back
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-400">
        No account?{' '}
        <Link href="/register" className="text-white underline">
          Register
        </Link>
        {' · '}
        <Link href="/forgot-password" className="text-white underline">
          Forgot password
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
