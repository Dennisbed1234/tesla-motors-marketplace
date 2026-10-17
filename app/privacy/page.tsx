export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 prose-invert">
      <h1 className="text-3xl font-semibold">Privacy policy</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-300">
        We collect account information you provide (name, email, phone, country) to operate reservations and orders.
        Passwords are stored as one-way hashes. Do not collect payment card numbers on this application — use a PCI-compliant payment provider when online payments are enabled.
        Replace this placeholder with counsel-reviewed policy text before accepting real customer data.
      </p>
    </div>
  );
}
