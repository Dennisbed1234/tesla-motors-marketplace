/**
 * Flexible outbound email: Resend API preferred, Gmail SMTP fallback.
 *
 * Env (pick one path):
 * - Resend: RESEND_API_KEY, RESEND_FROM, ADMIN_NOTIFY_EMAIL
 * - Gmail SMTP: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587, SMTP_USER, SMTP_PASS (app password), SMTP_FROM, ADMIN_NOTIFY_EMAIL
 */

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const adminCc = process.env.ADMIN_NOTIFY_EMAIL;

  if (process.env.RESEND_API_KEY) {
    const from = process.env.RESEND_FROM || 'Tesla Motors <onboarding@resend.dev>';
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
        html: opts.html || `<pre style="font-family:sans-serif">${opts.text}</pre>`,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error', err);
      throw new Error('Email send failed (Resend)');
    }
    return { provider: 'resend' as const };
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (host && user && pass) {
    // Dynamic import so build works without nodemailer types if not installed yet
    const nodemailer = await import('nodemailer');
    const port = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return { provider: 'smtp' as const };
  }

  console.warn('No email provider configured. Message logged only.', opts.subject, adminCc);
  return { provider: 'none' as const };
}

export async function notifyAdminNewChat(opts: {
  guestName: string;
  guestEmail: string;
  body: string;
  threadId: string;
}) {
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || '';
  if (!to) return;
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://tesla-motors-marketplace.vercel.app';
  await sendEmail({
    to,
    subject: `[Chat] New message from ${opts.guestName}`,
    text: `${opts.guestName} <${opts.guestEmail}> wrote:\n\n${opts.body}\n\nReply in admin: ${site}/admin/chat/${opts.threadId}`,
  }).catch((e) => console.error(e));
}
