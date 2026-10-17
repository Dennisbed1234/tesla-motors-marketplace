import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatMoney(amount: number | string, currency = 'USD') {
  const n = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function reservationRef() {
  return 'RSV-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export function orderRef() {
  return 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export const SPEC_UNAVAILABLE = 'Specification unavailable';

export const RANGE_DISCLAIMER =
  'Range, acceleration, charging performance, and other specifications may vary by configuration, region, software version, wheels, weather, driving style, and vehicle condition. Figures shown are based on published EPA estimates for the stated model year and trim where available. This marketplace is independent and is not owned or operated by Tesla, Inc.';
