import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Sample development inventory only.
 * Specs approximate publicly reported US figures for illustration.
 * Prices and availability are NOT live dealership offers.
 * This site is independent of Tesla, Inc.
 */
const vehicles = [
  {
    model: 'Model 3',
    modelYear: 2025,
    trim: 'Standard Rear-Wheel Drive',
    slug: 'model-3-2025-standard-rwd',
    description:
      'Entry sedan configuration oriented toward efficiency and everyday driving. Sample catalog listing for marketplace demonstration.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Pearl White Multi-Coat',
    interiorColor: 'Black',
    price: 36990,
    depositAmount: 500,
    inventoryStatus: 'AVAILABLE' as const,
    featured: true,
    driveType: 'RWD',
    accel060: '5.8 sec (est.)',
    topSpeed: '125 mph',
    rangeEpa: 321,
    rangeStandard: 'EPA',
    seating: 5,
    horsepower: 'approx. 286 hp',
    charging: 'Up to ~225 kW DC; Supercharger compatible',
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1600&q=80',
        altText: 'Tesla Model 3 exterior front three-quarter view',
        displayOrder: 0,
      },
      {
        url: 'https://images.unsplash.com/photo-1617704548623-340376564e68?w=1600&q=80',
        altText: 'Tesla Model 3 side profile',
        displayOrder: 1,
      },
    ],
  },
  {
    model: 'Model 3',
    modelYear: 2025,
    trim: 'Performance All-Wheel Drive',
    slug: 'model-3-2025-performance-awd',
    description: 'Performance-oriented Model 3 trim with dual-motor AWD. Sample listing.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Solid Black',
    interiorColor: 'Black',
    price: 54990,
    depositAmount: 1000,
    inventoryStatus: 'AVAILABLE' as const,
    featured: true,
    driveType: 'AWD',
    accel060: '~2.9–3.1 sec (est.)',
    topSpeed: '163 mph',
    rangeEpa: 306,
    rangeStandard: 'EPA',
    seating: 5,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1600&q=80',
        altText: 'Tesla Model 3 Performance exterior',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Model Y',
    modelYear: 2025,
    trim: 'Standard Rear-Wheel Drive',
    slug: 'model-y-2025-standard-rwd',
    description: 'Compact SUV entry trim. Sample catalog listing.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Stealth Grey',
    interiorColor: 'Black',
    price: 39990,
    depositAmount: 500,
    inventoryStatus: 'AVAILABLE' as const,
    featured: true,
    driveType: 'RWD',
    accel060: '6.8 sec (est.)',
    topSpeed: '125 mph',
    rangeEpa: 321,
    rangeStandard: 'EPA',
    seating: 5,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1619315950246-8c3b4b3c0c0a?w=1600&q=80',
        altText: 'Tesla Model Y exterior',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Model Y',
    modelYear: 2025,
    trim: 'Premium All-Wheel Drive',
    slug: 'model-y-2025-premium-awd',
    description: 'All-wheel-drive Model Y premium configuration. Sample listing.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Deep Blue Metallic',
    interiorColor: 'White',
    price: 48990,
    depositAmount: 750,
    inventoryStatus: 'AVAILABLE' as const,
    featured: true,
    driveType: 'AWD',
    accel060: '4.6 sec (est.)',
    rangeEpa: 327,
    rangeStandard: 'EPA',
    seating: 5,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1620891549027-942fdc95d3f5?w=1600&q=80',
        altText: 'Tesla Model Y AWD exterior',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Model S',
    modelYear: 2025,
    trim: 'Plaid',
    slug: 'model-s-2025-plaid',
    description:
      'Flagship sedan with tri-motor configuration. Catalog reference; verify current production status for your market.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Ultra Red',
    interiorColor: 'Black and White',
    price: 94990,
    depositAmount: 2500,
    inventoryStatus: 'CATALOG_ONLY' as const,
    featured: false,
    driveType: 'AWD (tri-motor)',
    accel060: '1.99 sec (est., with rollout subtracted)',
    topSpeed: '200 mph',
    rangeEpa: 368,
    rangeStandard: 'EPA',
    seating: 5,
    horsepower: 'up to ~1,020 hp',
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1600&q=80',
        altText: 'Tesla Model S exterior',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Model X',
    modelYear: 2025,
    trim: 'Plaid',
    slug: 'model-x-2025-plaid',
    description: 'Full-size SUV with falcon-wing doors heritage. Sample catalog listing.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Midnight Silver Metallic',
    interiorColor: 'Cream',
    price: 104990,
    depositAmount: 2500,
    inventoryStatus: 'CATALOG_ONLY' as const,
    featured: false,
    driveType: 'AWD (tri-motor)',
    accel060: '2.5 sec (est.)',
    rangeEpa: 335,
    rangeStandard: 'EPA',
    seating: 6,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1617704548623-340376564e68?w=1600&q=80',
        altText: 'Tesla Model X style exterior reference',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Cybertruck',
    modelYear: 2025,
    trim: 'All-Wheel Drive',
    slug: 'cybertruck-2025-awd',
    description: 'Stainless exterior pickup. Sample inventory for marketplace demo.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Stainless Steel',
    interiorColor: 'Black',
    price: 69990,
    depositAmount: 1000,
    inventoryStatus: 'AVAILABLE' as const,
    featured: true,
    driveType: 'AWD',
    accel060: '~4.1 sec (est.)',
    topSpeed: '112 mph',
    rangeEpa: 325,
    rangeStandard: 'EPA',
    seating: 5,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=1600&q=80',
        altText: 'Tesla Cybertruck exterior',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Cybertruck',
    modelYear: 2025,
    trim: 'Cyberbeast',
    slug: 'cybertruck-2025-cyberbeast',
    description: 'Tri-motor Cybertruck performance configuration. Sample listing.',
    category: 'PASSENGER' as const,
    condition: 'SAMPLE' as const,
    exteriorColor: 'Stainless Steel',
    interiorColor: 'Black',
    price: 99990,
    depositAmount: 2000,
    inventoryStatus: 'AVAILABLE' as const,
    featured: false,
    driveType: 'AWD (tri-motor)',
    accel060: '~2.6 sec (est.)',
    topSpeed: '130 mph',
    rangeEpa: 320,
    rangeStandard: 'EPA',
    seating: 5,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=1600&q=80',
        altText: 'Tesla Cybertruck Cyberbeast exterior',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Semi',
    modelYear: 2024,
    trim: 'Commercial Class 8',
    slug: 'semi-commercial',
    description:
      'Commercial heavy-duty electric tractor. Not available as a consumer passenger vehicle. Catalog reference only.',
    category: 'COMMERCIAL' as const,
    condition: 'SAMPLE' as const,
    price: 0,
    inventoryStatus: 'CATALOG_ONLY' as const,
    featured: false,
    driveType: 'AWD',
    seating: 2,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1600&q=80',
        altText: 'Electric semi truck concept reference',
        displayOrder: 0,
      },
    ],
  },
  {
    model: 'Roadster',
    modelYear: 2028,
    trim: 'Announced',
    slug: 'roadster-announced',
    description:
      'Next-generation Roadster as announced by Tesla. Not currently available for customer delivery. Catalog placeholder only.',
    category: 'ANNOUNCED' as const,
    condition: 'SAMPLE' as const,
    price: 200000,
    inventoryStatus: 'CATALOG_ONLY' as const,
    featured: false,
    accel060: 'Under 2 sec (claimed; not independently verified for production units)',
    seating: 4,
    market: 'US',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1553440569-bcc899a47639?w=1600&q=80',
        altText: 'Sports car silhouette placeholder for announced Roadster',
        displayOrder: 0,
      },
    ],
  },
];

async function main() {
  console.log('Seeding…');

  for (const v of vehicles) {
    const { images, ...rest } = v;
    const vehicle = await prisma.vehicle.upsert({
      where: { slug: rest.slug },
      update: {
        ...rest,
        disclaimer:
          'Sample development listing. Not a live offer from Tesla, Inc. Specs approximate publicly discussed figures and may be outdated.',
      },
      create: {
        ...rest,
        disclaimer:
          'Sample development listing. Not a live offer from Tesla, Inc. Specs approximate publicly discussed figures and may be outdated.',
        images: {
          create: images,
        },
      },
    });

    const count = await prisma.vehicleImage.count({ where: { vehicleId: vehicle.id } });
    if (count === 0 && images?.length) {
      await prisma.vehicleImage.createMany({
        data: images.map((img) => ({ ...img, vehicleId: vehicle.id })),
      });
    }
  }

  await prisma.siteContent.upsert({
    where: { key: 'about' },
    update: {},
    create: {
      key: 'about',
      title: 'About Tesla Motors Marketplace',
      body: 'We are an independent premium electric vehicle marketplace focused on Tesla models. We are not owned, operated, or officially affiliated with Tesla, Inc. Listings marked SAMPLE are for demonstration until real inventory is configured by the operator.',
    },
  });

  await prisma.siteContent.upsert({
    where: { key: 'faq' },
    update: {},
    create: {
      key: 'faq',
      title: 'Frequently Asked Questions',
      body: 'Q: Are you Tesla, Inc.?\nA: No. This is an independent marketplace.\n\nQ: Are sample vehicles for sale?\nA: Sample listings are labeled SAMPLE / CATALOG_ONLY until an administrator publishes real stock.\n\nQ: How do reservations work?\nA: Logged-in customers can request a reservation. Availability is checked on the server. An administrator confirms before any vehicle is marked reserved.',
    },
  });

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.toLowerCase();
  const adminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (adminEmail && adminPass) {
    const hash = await bcrypt.hash(adminPass, 12);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { role: 'ADMIN', passwordHash: hash },
      create: {
        email: adminEmail,
        fullName: 'Site Administrator',
        passwordHash: hash,
        role: 'ADMIN',
        emailVerified: true,
      },
    });
    console.log('Admin user ready:', adminEmail);
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
