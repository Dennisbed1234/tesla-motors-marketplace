import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Forgot password</h1>
      <p className="mt-3 text-sm text-ink-400">
        Password reset emails require a transactional email provider (Resend) and the PasswordReset table already in the schema.
        Wire the token flow under <code className="text-ink-200">/api/auth/forgot-password</code> when RESEND_API_KEY is set.
      </p>
      <Link href="/login" className="btn-secondary mt-8 inline-flex">Back to log in</Link>
    </div>
  );
}
