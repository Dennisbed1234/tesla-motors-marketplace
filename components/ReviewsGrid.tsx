'use client';

import { useMemo, useState } from 'react';
import type { Review } from '@/lib/reviews';

function stars(n: number) {
  return '★'.repeat(Math.max(1, Math.min(5, n))) + '☆'.repeat(Math.max(0, 5 - n));
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso + 'T12:00:00Z');
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function ReviewsGrid({ reviews }: { reviews: Review[] }) {
  const [visible, setVisible] = useState(24);
  const slice = useMemo(() => reviews.slice(0, visible), [reviews, visible]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slice.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-sm"
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.avatar}
                alt=""
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover bg-neutral-800"
                loading="lazy"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.onerror = null;
                  el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    r.name
                  )}&background=222&color=fff`;
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{r.name}</p>
                <p className="truncate text-xs text-neutral-400">
                  {r.role}, {r.city}
                </p>
                <p className="mt-1 text-xs tracking-wide text-amber-300">{stars(r.rating)}</p>
              </div>
              <p className="shrink-0 text-[11px] text-neutral-500">{formatDate(r.date)}</p>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-300">{r.text}</p>
            <p className="mt-3 text-[11px] uppercase tracking-wider text-neutral-500">{r.model}</p>
          </article>
        ))}
      </div>

      {visible < reviews.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => Math.min(reviews.length, v + 24))}
            className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10"
          >
            Show more reviews ({reviews.length - visible} left)
          </button>
        </div>
      )}
    </div>
  );
}
