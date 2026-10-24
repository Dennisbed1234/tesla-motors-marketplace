import type { Metadata } from 'next';
import Link from 'next/link';
import { ReviewsGrid } from '@/components/ReviewsGrid';
import { REVIEWS, REVIEW_COUNT } from '@/lib/reviews';
import { getSiteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Customer Reviews',
  description:
    'Read customer reviews of Tesla Motors Marketplace. Real feedback on reservations, deposits, shipping, and Tesla vehicle orders.',
  alternates: { canonical: '/reviews' },
  openGraph: {
    title: 'Customer Reviews | Tesla Motors Marketplace',
    description: 'What buyers say about ordering Tesla vehicles through our marketplace.',
    url: `${getSiteUrl()}/reviews`,
  },
};

function buildReviewJsonLd() {
  const sum = REVIEWS.reduce((s, r) => s + (r.rating || 5), 0);
  const avg = REVIEW_COUNT > 0 ? Math.round((sum / REVIEW_COUNT) * 10) / 10 : 5;
  const sample = REVIEWS.slice(0, 8).map((r) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    datePublished: r.date,
    reviewBody: r.text.slice(0, 320),
    reviewRating: {
      '@type': 'Rating',
      ratingValue: String(r.rating),
      bestRating: '5',
      worstRating: '1',
    },
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tesla Motors Marketplace',
    url: getSiteUrl(),
    description:
      'Independent affiliate marketplace for Tesla electric vehicles. Browse, reserve, and order.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(avg),
      bestRating: '5',
      worstRating: '1',
      ratingCount: String(REVIEW_COUNT),
      reviewCount: String(REVIEW_COUNT),
    },
    review: sample,
  };
}

export default function ReviewsPage() {
  const jsonLd = buildReviewJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Reviews
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Trusted by buyers worldwide
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-400">
            {REVIEW_COUNT.toLocaleString('en-US')} reviews from customers who reserved and ordered
            Tesla vehicles through Tesla Motors Marketplace. Feedback covers deposits, shipping,
            Roadster and Cybertruck reservations, and support.
          </p>
        </div>

        <div className="mt-10">
          <ReviewsGrid reviews={REVIEWS} />
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Link
            href="/vehicles"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black"
          >
            Browse vehicles
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
          >
            Create account
          </Link>
        </div>
      </div>
    </>
  );
}
