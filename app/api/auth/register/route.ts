import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createSession, hashPassword, bootstrapAdminIfNeeded } from '@/lib/auth';

const schema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().max(40).optional(),
  country: z.string().max(80).optional(),
  password: z.string().min(8).max(128),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true),
});

export async function POST(req: Request) {
  try {
    await bootstrapAdminIfNeeded();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid registration data' }, { status: 400 });
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
        phone: parsed.data.phone?.trim() || null,
        country: parsed.data.country?.trim() || null,
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
