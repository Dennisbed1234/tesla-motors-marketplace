import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MarkNotificationsRead } from '@/components/MarkNotificationsRead';

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/admin/login');

  const notifications = await prisma.adminNotification
    .findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    .catch(() => []);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-ink-400">
            {unread} unread · Signups and orders also email {process.env.ADMIN_NOTIFY_EMAIL || 'admin'}
          </p>
        </div>
        <div className="flex gap-2">
          <MarkNotificationsRead />
          <Link href="/admin" className="text-sm text-ink-400 hover:text-white">← Dashboard</Link>
        </div>
      </div>

      <ul className="mt-8 space-y-3">
        {notifications.length === 0 && (
          <li className="text-sm text-ink-400">No notifications yet.</li>
        )}
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`card p-4 ${
              n.read ? 'opacity-70' : 'border-white/25'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-ink-500">{n.type}</p>
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink-300">{n.body}</p>
                <p className="mt-2 text-xs text-ink-500">{n.createdAt.toLocaleString()}</p>
              </div>
              {n.href && (
                <Link href={n.href} className="shrink-0 text-xs text-accent-soft hover:underline">
                  Open
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
