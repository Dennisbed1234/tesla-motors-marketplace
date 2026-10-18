import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { verifyEmailCode } from '@/lib/otp';

const schema = z.object({
  code: z.string().min(4).max(8),
  phone: z.string().max(40).optional(),
  phoneCountryCode: z.string().max(10).optional(),
  country: z.string().max(80).optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  stateRegion: z.string().max(100).optional(),
  postalCode: z.string().max(30).optional(),
  fullName: z.string().min(1).max(120).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const valid = await verifyEmailCode(session.id, parsed.data.code, 'profile');
    if (!valid) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
    }

    const { code: _c, ...fields } = parsed.data;
    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        ...(fields.fullName !== undefined ? { fullName: fields.fullName } : {}),
        ...(fields.phone !== undefined ? { phone: fields.phone } : {}),
        ...(fields.phoneCountryCode !== undefined
          ? { phoneCountryCode: fields.phoneCountryCode }
          : {}),
        ...(fields.country !== undefined ? { country: fields.country } : {}),
        ...(fields.addressLine1 !== undefined ? { addressLine1: fields.addressLine1 } : {}),
        ...(fields.addressLine2 !== undefined ? { addressLine2: fields.addressLine2 } : {}),
        ...(fields.city !== undefined ? { city: fields.city } : {}),
        ...(fields.stateRegion !== undefined ? { stateRegion: fields.stateRegion } : {}),
        ...(fields.postalCode !== undefined ? { postalCode: fields.postalCode } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        phoneCountryCode: true,
        country: true,
        addressLine1: true,
        addressLine2: true,
        city: true,
        stateRegion: true,
        postalCode: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
