import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function notifyAdmins(opts: {
  type: string;
  title: string;
  body: string;
  href?: string;
  emailSubject?: string;
  emailText?: string;
  meta?: Record<string, unknown>;
}) {
  await prisma.adminNotification
    .create({
      data: {
        type: opts.type,
        title: opts.title,
        body: opts.body,
        href: opts.href || null,
        meta: opts.meta || undefined,
      },
    })
    .catch((e) => console.error('AdminNotification create failed', e));

  const to =
    process.env.ADMIN_NOTIFY_EMAIL ||
    process.env.SMTP_USER ||
    'personalofficedesk@gmail.com';

  await sendEmail({
    to,
    subject: opts.emailSubject || opts.title,
    text: opts.emailText || opts.body,
  }).catch((e) => console.error('Admin email notify failed', e));
}
