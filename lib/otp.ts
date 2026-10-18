import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Store 6-digit code on user via PasswordReset token (expires 15 min). */
export async function issueEmailCode(userId: string, email: string, purpose: string) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Invalidate prior unused codes for this user
  await prisma.passwordReset.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  await prisma.passwordReset.create({
    data: {
      userId,
      token: `${purpose}:${code}`,
      expiresAt,
    },
  });

  const result = await sendEmail({
    to: email,
    subject: `Your Tesla Motors verification code: ${code}`,
    text: `Your verification code is ${code}.\n\nIt expires in 15 minutes.\n\nIf you did not request this, you can ignore this email.`,
    html: `<p style="font-family:sans-serif;font-size:16px">Your verification code is:</p>
      <p style="font-family:monospace;font-size:28px;letter-spacing:4px;font-weight:bold">${code}</p>
      <p style="font-family:sans-serif;font-size:13px;color:#666">Expires in 15 minutes.</p>`,
  });

  return {
    code,
    emailed: result.provider !== 'none',
    // Only expose code when no email provider (local/dev)
    devCode: result.provider === 'none' ? code : undefined,
  };
}

export async function verifyEmailCode(userId: string, code: string, purpose: string) {
  const token = `${purpose}:${code.trim()}`;
  const row = await prisma.passwordReset.findFirst({
    where: {
      userId,
      token,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });
  if (!row) return false;
  await prisma.passwordReset.update({ where: { id: row.id }, data: { used: true } });
  return true;
}
