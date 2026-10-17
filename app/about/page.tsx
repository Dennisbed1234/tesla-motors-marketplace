export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">About us</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-ink-300">
        <p>
          Tesla Motors Marketplace is an independent premium electric vehicle marketplace focused on Tesla models.
          We are not owned, operated, or officially affiliated with Tesla, Inc.
        </p>
        <p>
          Our goal is transparent listings, detailed specifications where verified, secure customer accounts, and a
          reservation workflow that checks real inventory status on the server before confirming interest.
        </p>
        <p>
          Development seed data is labeled SAMPLE or CATALOG ONLY and must not be treated as live stock until an
          authorized administrator publishes real inventory.
        </p>
      </div>
    </div>
  );
}
