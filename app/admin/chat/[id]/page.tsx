import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminChatReply } from '@/components/AdminChatReply';

export const dynamic = 'force-dynamic';

export default async function AdminChatThreadPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login?next=/admin/chat/' + params.id);
  if (session.role !== 'ADMIN') redirect('/account');

  const thread = await prisma.chatThread.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
      user: { select: { fullName: true, email: true } },
    },
  });
  if (!thread) notFound();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col px-4 py-10 sm:px-6">
      <Link href="/admin/chat" className="text-sm text-ink-400 hover:text-white">← All chats</Link>
      <h1 className="mt-4 text-xl font-semibold">
        {thread.guestName || thread.user?.fullName || 'Guest'}
      </h1>
      <p className="text-sm text-ink-400">{thread.guestEmail || thread.user?.email}</p>

      <div className="card mt-6 flex flex-1 flex-col">
        <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ minHeight: 320 }}>
          {thread.messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.isAdmin ? 'ml-auto bg-accent text-white' : 'bg-ink-800'
              }`}
            >
              <p className="text-[10px] opacity-70">{m.isAdmin ? 'You (admin)' : 'Customer'}</p>
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className="mt-1 text-[10px] opacity-50">{m.createdAt.toLocaleString()}</p>
            </div>
          ))}
        </div>
        <AdminChatReply threadId={thread.id} />
      </div>
    </div>
  );
}
