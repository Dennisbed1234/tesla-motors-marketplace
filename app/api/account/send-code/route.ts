import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { issueEmailCode } from '@/lib/otp';

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const issued = await issueEmailCode(user.id, user.email, 'profile');
    return NextResponse.json({
      ok: true,
      message: issued.emailed
        ? 'Code sent to your email.'
        : 'Code generated (configure email to receive it).',
      devCode: issued.devCode,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Could not send code' }, { status: 500 });
  }
}
