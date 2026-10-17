import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const staticRoutes = ['', '/vehicles', '/compare', '/how-it-works', '/about', '/contact', '/faq', '/privacy', '/terms', '/login', '/register'].map(
    (path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })
  );

  let vehicles: { slug: string; updatedAt: Date }[] = [];
  try {
    vehicles = await prisma.vehicle.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    });
  } catch {
    vehicles = [];
  }

  return [
    ...staticRoutes,
    ...vehicles.map((v) => ({
      url: `${base}/vehicles/${v.slug}`,
      lastModified: v.updatedAt,
    })),
  ];
}
