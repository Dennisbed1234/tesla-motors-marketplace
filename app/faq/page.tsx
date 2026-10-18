export default function FaqPage() {
  const items = [
    {
      q: 'Are you part of Tesla, Inc.?',
      a: 'Tesla Motors Marketplace is an authorized affiliate partner focused on Tesla electric vehicles. We help customers browse, compare, reserve, and complete purchases of Tesla models through our New York based team.',
    },
    {
      q: 'Why does this site look different from tesla.com?',
      a: 'This is our affiliate marketplace experience, built for browsing inventory, placing deposits, and working with our advisors. Official product engineering and factory delivery programs remain with Tesla, Inc. Your order with us is handled by our team from start to delivery coordination.',
    },
    {
      q: 'Are the vehicles real and available?',
      a: 'Yes. Listings on this site represent vehicles we can process for order and delivery. Availability, pricing, and configurations are confirmed with our team when you place an order or reservation.',
    },
    {
      q: 'How do reservations and orders work?',
      a: 'Create an account, choose a vehicle, select a payment plan (25% down, 50% deposit, or full payment), and submit your order. Our team verifies payment and coordinates the next steps with you.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'Credit or debit card, wire transfer, and selected cryptocurrencies. Instructions appear on your order confirmation page after you place an order.',
    },
    {
      q: 'Is financing available?',
      a: 'Financing options may be available depending on your location and qualification. Contact our team after you place an inquiry and we will guide you through available paths.',
    },
    {
      q: 'Who do I contact for support?',
      a: 'Use live chat on this site or call (347) 508-6807. Our office is at 235 East 42nd Street, New York, NY 10017.',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">Frequently asked questions</h1>
      <p className="mt-3 text-sm text-ink-400">
        Clear answers so you always know who we are and how ordering works.
      </p>
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
