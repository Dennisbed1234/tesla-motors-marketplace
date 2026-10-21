import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { vehicles } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding…');

  for (const v of vehicles) {
    const { images, ...rest } = v;
    const vehicle = await prisma.vehicle.upsert({
      where: { slug: rest.slug },
      update: { ...rest, disclaimer: null },
      create: {
        ...rest,
        disclaimer: null,
        images: { create: images },
      },
    });

    const count = await prisma.vehicleImage.count({ where: { vehicleId: vehicle.id } });
    if (count === 0 && images?.length) {
      await prisma.vehicleImage.createMany({
        data: images.map((img) => ({ ...img, vehicleId: vehicle.id })),
      });
    } else if (images?.[0]) {
      const first = await prisma.vehicleImage.findFirst({
        where: { vehicleId: vehicle.id },
        orderBy: { displayOrder: 'asc' },
      });
      if (first) {
        await prisma.vehicleImage.update({
          where: { id: first.id },
          data: { url: images[0].url, altText: images[0].altText },
        });
      }
    }
  }

  await prisma.vehicleImage.deleteMany({
    where: { vehicle: { slug: { in: ['roadster-announced', 'roadster-2026', 'roadster-base'] } } },
  }).catch(() => null);
  await prisma.vehicle.deleteMany({
    where: { slug: { in: ['roadster-announced', 'roadster-2026', 'roadster-base'] } },
  }).catch(() => null);

  const adminEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'personalofficedesk@gmail.com').toLowerCase();
  const adminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Yalateef1$';
  const hash = await bcrypt.hash(adminPass, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: 'ADMIN', passwordHash: hash, fullName: 'DaddyG', status: 'ACTIVE' },
    create: {
      email: adminEmail,
      fullName: 'DaddyG',
      passwordHash: hash,
      role: 'ADMIN',
      emailVerified: true,
      status: 'ACTIVE',
    },
  });
  console.log('Admin ready:', adminEmail);
  console.log('Seed complete. Vehicles:', vehicles.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
