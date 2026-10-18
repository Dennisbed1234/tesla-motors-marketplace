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

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://tesla-motors-marketplace.vercel.app';
}

export async function notifyAdminNewChat(opts: {
  guestName: string;
  guestEmail: string;
  body: string;
  threadId: string;
}) {
  const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || '';
  if (!to) return;
  const site = siteUrl();
  await sendEmail({
    to,
    subject: `[Chat] New message from ${opts.guestName}`,
    text: `${opts.guestName} <${opts.guestEmail}> wrote:\n\n${opts.body}\n\nReply in admin: ${site}/admin/chat/${opts.threadId}`,
  }).catch((e) => console.error(e));
}

/** Confirm to the user that we received their message. */
export async function notifyUserChatReceived(opts: {
  to: string;
  name: string;
  body: string;
}) {
  if (!opts.to) return;
  const site = siteUrl();
  await sendEmail({
    to: opts.to,
    subject: 'We received your message · Tesla Motors Marketplace',
    text: `Hi ${opts.name},\n\nThanks for contacting Tesla Motors Marketplace support. We received your message:\n\n"${opts.body}"\n\nOur team typically replies within minutes. You can continue the conversation here:\n${site}/chat\n\nTesla Motors Marketplace\n(347) 508-6807`,
    html: `<div style="font-family:sans-serif;line-height:1.5;color:#111">
      <p>Hi ${escapeHtml(opts.name)},</p>
      <p>Thanks for contacting <strong>Tesla Motors Marketplace</strong> support. We received your message:</p>
      <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#444">${escapeHtml(opts.body)}</blockquote>
      <p>Our team typically replies within minutes. Continue the chat: <a href="${site}/chat">${site}/chat</a></p>
      <p style="color:#666;font-size:13px">Tesla Motors Marketplace · (347) 508-6807</p>
    </div>`,
  }).catch((e) => console.error('notifyUserChatReceived', e));
}

/** Email the user when support (admin) replies. */
export async function notifyUserChatReply(opts: {
  to: string;
  name: string;
  body: string;
  threadId: string;
}) {
  if (!opts.to) return;
  const site = siteUrl();
  await sendEmail({
    to: opts.to,
    subject: 'New reply from Tesla Motors support',
    text: `Hi ${opts.name},\n\nYou have a new reply from our support team:\n\n"${opts.body}"\n\nContinue the conversation:\n${site}/chat\n\nTesla Motors Marketplace\n(347) 508-6807`,
    html: `<div style="font-family:sans-serif;line-height:1.5;color:#111">
      <p>Hi ${escapeHtml(opts.name)},</p>
      <p>You have a new reply from our support team:</p>
      <blockquote style="border-left:3px solid #4D148C;padding-left:12px;color:#222">${escapeHtml(opts.body)}</blockquote>
      <p><a href="${site}/chat" style="display:inline-block;background:#111;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none">Open chat</a></p>
      <p style="color:#666;font-size:13px">Tesla Motors Marketplace · (347) 508-6807</p>
    </div>`,
  }).catch((e) => console.error('notifyUserChatReply', e));
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
