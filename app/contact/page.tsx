export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-3 text-sm text-ink-400">
        Update this page with your real business email, phone, and address before launch.
      </p>
      <form className="mt-8 space-y-4" action="#" method="post" onSubmit={(e) => e.preventDefault()}>
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={5} className="input" required />
        </div>
        <button type="submit" className="btn-primary">Send message</button>
        <p className="text-xs text-ink-500">Wire this form to your email provider (e.g. Resend) when credentials are configured.</p>
      </form>
    </div>
  );
}
