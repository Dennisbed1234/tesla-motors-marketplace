export default function FaqPage() {
  const items = [
    {
      q: 'Are you Tesla, Inc.?',
      a: 'No. This is an independent vehicle marketplace focused on Tesla models.',
    },
    {
      q: 'Are sample vehicles for sale?',
      a: 'Listings marked SAMPLE or CATALOG ONLY are for demonstration until an administrator publishes real stock.',
    },
    {
      q: 'How do reservations work?',
      a: 'Logged-in customers can request a reservation. The server checks that the vehicle is still AVAILABLE and has no active reservation before creating a record and marking the vehicle RESERVED.',
    },
    {
      q: 'Is financing available?',
      a: 'Only if the operator configures a real financing partner. This software does not invent financing offers.',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Frequently asked questions</h1>
      <dl className="mt-8 space-y-6">
        {items.map((item) => (
          <div key={item.q} className="card p-5">
            <dt className="font-medium">{item.q}</dt>
            <dd className="mt-2 text-sm text-ink-400">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
