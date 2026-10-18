import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword, bootstrapAdminIfNeeded } from '@/lib/auth';
import { issueEmailCode } from '@/lib/otp';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** Step 1: verify password, send email code — no session yet. */
export async function POST(req: Request) {
  try {
    await bootstrapAdminIfNeeded();
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const issued = await issueEmailCode(user.id, user.email, 'login');

    return NextResponse.json({
      ok: true,
      requiresCode: true,
      email: user.email,
      message: issued.emailed
        ? 'We sent a 6-digit code to your email. Enter it to finish signing in.'
        : 'Enter the verification code (email not configured — see devCode).',
      devCode: issued.devCode,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
