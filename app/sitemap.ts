import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { getSiteUrl } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = [
    '',
    '/vehicles',
    '/compare',
    '/reviews',
    '/how-it-works',
    '/about',
    '/contact',
    '/faq',
    '/privacy',
    '/terms',
    '/refunds',
    '/delivery',
    '/login',
    '/register',
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' || path === '/vehicles' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : path === '/vehicles' ? 0.9 : path === '/reviews' ? 0.8 : 0.6,
  }));

  let vehicles: { slug: string; updatedAt: Date }[] = [];
  try {
    vehicles = await prisma.vehicle.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    vehicles = [];
  }

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${base}/vehicles/${v.slug}`,
    lastModified: v.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}
