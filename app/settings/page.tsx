'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Profile = {
  email: string;
  fullName: string;
  phone?: string | null;
  phoneCountryCode?: string | null;
  country?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateRegion?: string | null;
  postalCode?: string | null;
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) {
          router.replace('/login?next=/settings');
          return;
        }
        setProfile(d.user);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function sendCode() {
    setSending(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch('/api/account/send-code', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send code');
        return;
      }
      setCodeSent(true);
      setMessage(data.message || 'Code sent');
      if (data.devCode) setDevCode(data.devCode);
    } finally {
      setSending(false);
    }
  }

  async function onSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: fd.get('code'),
          fullName: fd.get('fullName'),
          phone: fd.get('phone'),
          phoneCountryCode: fd.get('phoneCountryCode'),
          country: fd.get('country'),
          addressLine1: fd.get('addressLine1'),
          addressLine2: fd.get('addressLine2'),
          city: fd.get('city'),
          stateRegion: fd.get('stateRegion'),
          postalCode: fd.get('postalCode'),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Update failed');
        return;
      }
      setProfile(data.user);
      setMessage('Profile updated successfully.');
      setCodeSent(false);
      setDevCode('');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="px-4 py-16 text-center text-sm text-ink-400">Loading…</p>;
  }
  if (!profile) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-ink-400">
        Update your phone and address. We email a verification code before saving changes.
      </p>

      <form onSubmit={onSave} className="mt-8 space-y-4">
        <div>
          <label className="label">Email</label>
          <input className="input opacity-70" value={profile.email} disabled />
        </div>
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            className="input"
            defaultValue={profile.fullName}
            required
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label" htmlFor="phoneCountryCode">
              Code
            </label>
            <input
              id="phoneCountryCode"
              name="phoneCountryCode"
              className="input"
              placeholder="+1"
              defaultValue={profile.phoneCountryCode || ''}
            />
          </div>
          <div className="col-span-2">
            <label className="label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              className="input"
              defaultValue={profile.phone || ''}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="addressLine1">
            Street address
          </label>
          <input
            id="addressLine1"
            name="addressLine1"
            className="input"
            defaultValue={profile.addressLine1 || ''}
          />
        </div>
        <div>
          <label className="label" htmlFor="addressLine2">
            Apt / suite
          </label>
          <input
            id="addressLine2"
            name="addressLine2"
            className="input"
            defaultValue={profile.addressLine2 || ''}
          />
        </div>
        <div>
          <label className="label" htmlFor="city">
            City
          </label>
          <input id="city" name="city" className="input" defaultValue={profile.city || ''} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="stateRegion">
              State / region
            </label>
            <input
              id="stateRegion"
              name="stateRegion"
              className="input"
              defaultValue={profile.stateRegion || ''}
            />
          </div>
          <div>
            <label className="label" htmlFor="postalCode">
              ZIP / postal
            </label>
            <input
              id="postalCode"
              name="postalCode"
              className="input"
              defaultValue={profile.postalCode || ''}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="country">
            Country
          </label>
          <input
            id="country"
            name="country"
            className="input"
            defaultValue={profile.country || ''}
          />
        </div>

        <div className="rounded-xl border border-white/10 bg-ink-900/50 p-4">
          <p className="text-sm font-medium text-white">Email verification</p>
          <p className="mt-1 text-xs text-ink-400">
            Request a code, then enter it below to save your changes.
          </p>
          <button
            type="button"
            onClick={sendCode}
            disabled={sending}
            className="btn-secondary mt-3 text-sm"
          >
            {sending ? 'Sending…' : codeSent ? 'Resend code' : 'Send code to my email'}
          </button>
          {devCode && (
            <p className="mt-2 text-xs text-amber-200">
              Dev code: <span className="font-mono">{devCode}</span>
            </p>
          )}
          <div className="mt-3">
            <label className="label" htmlFor="code">
              Verification code
            </label>
            <input
              id="code"
              name="code"
              className="input font-mono tracking-widest"
              required
              inputMode="numeric"
              placeholder="000000"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-500">
        <Link href="/account" className="underline">
          Back to account
        </Link>
      </p>
    </div>
  );
}
