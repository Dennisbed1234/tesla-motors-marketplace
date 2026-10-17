export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-3 text-sm text-ink-400">
        Update this page with your real business email, phone, and address before launch.
      </p>
      <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-ink-900/50 p-6 text-sm text-ink-300">
        <p><span className="text-ink-500">Email:</span> support@example.com</p>
        <p><span className="text-ink-500">Phone:</span> +1 (000) 000-0000</p>
        <p><span className="text-ink-500">Address:</span> Configure in admin content settings</p>
      </div>
      <p className="mt-6 text-xs text-ink-500">
        Connect a form handler (Resend or similar) when transactional email is configured.
      </p>
    </div>
  );
}
