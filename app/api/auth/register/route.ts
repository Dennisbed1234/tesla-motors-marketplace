import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword, bootstrapAdminIfNeeded } from '@/lib/auth';

const schema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  country: z.string().min(2).max(80),
  phoneCountryCode: z.string().min(1).max(8),
  phone: z.string().min(5).max(40),
  addressLine1: z.string().min(3).max(200),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().min(2).max(100),
  stateRegion: z.string().min(1).max(100),
  postalCode: z.string().min(2).max(20),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true),
});

export async function POST(req: Request) {
  try {
    await bootstrapAdminIfNeeded();
    const body = await req.json();
    const parsed = schema.safeParse({
      ...body,
      addressLine2: body.addressLine2 || null,
      acceptTerms: body.acceptTerms === true || body.acceptTerms === 'on',
    });
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please complete all required fields' }, { status: 400 });
    }
    if (parsed.data.password !== parsed.data.confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email,
        fullName: parsed.data.fullName.trim(),
        country: parsed.data.country.trim(),
        phoneCountryCode: parsed.data.phoneCountryCode.trim(),
        phone: parsed.data.phone.trim(),
        addressLine1: parsed.data.addressLine1.trim(),
        addressLine2: parsed.data.addressLine2?.trim() || null,
        city: parsed.data.city.trim(),
        stateRegion: parsed.data.stateRegion.trim(),
        postalCode: parsed.data.postalCode.trim(),
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    await createSession({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
