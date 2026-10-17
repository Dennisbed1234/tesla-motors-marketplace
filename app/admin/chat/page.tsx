import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminChatInboxPage() {
  const session = await getSession();
  if (!session) redirect('/login?next=/admin/chat');
  if (session.role !== 'ADMIN') redirect('/account');

  const threads = await prisma.chatThread.findMany({
    orderBy: { lastMessageAt: 'desc' },
    take: 100,
    include: {
      user: { select: { fullName: true, email: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Live chat</h1>
        <Link href="/admin" className="text-sm text-ink-400 hover:text-white">← Dashboard</Link>
      </div>
      <ul className="mt-8 space-y-3">
        {threads.length === 0 && (
          <li className="text-sm text-ink-400">No conversations yet. Customers start chat at /chat.</li>
        )}
        {threads.map((t) => (
          <li key={t.id}>
            <Link href={`/admin/chat/${t.id}`} className="card block p-4 hover:border-white/25">
              <div className="flex justify-between gap-2">
                <p className="font-medium">
                  {t.guestName || t.user?.fullName || 'Guest'}{' '}
                  <span className="text-xs font-normal text-ink-400">
                    {t.guestEmail || t.user?.email}
                  </span>
                </p>
                <span className="text-xs text-ink-500">{t.status}</span>
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-ink-400">
                {t.messages[0]?.body || 'No messages'}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
