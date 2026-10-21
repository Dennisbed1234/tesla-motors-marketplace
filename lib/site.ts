/** Canonical public origin for sitemap, robots, Open Graph, and JSON-LD. */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    'https://teslamotors.sale';

  const withProtocol = raw.startsWith('http') ? raw : `https://${raw}`;
  return withProtocol.replace(/\/$/, '');
}

export function absoluteUrl(pathOrUrl: string | null | undefined): string | undefined {
  if (!pathOrUrl) return undefined;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  const base = getSiteUrl();
  return pathOrUrl.startsWith('/') ? `${base}${pathOrUrl}` : `${base}/${pathOrUrl}`;
}

export const SITE_NAME = 'Tesla Motors Marketplace';
export const SITE_TAGLINE =
  'Premium marketplace for Tesla electric vehicles. Browse models, compare specifications, reserve, and place orders.';
