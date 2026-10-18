import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  notifyAdminNewChat,
  notifyUserChatReceived,
  notifyUserChatReply,
} from '@/lib/email';

const startSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  body: z.string().min(1).max(4000),
  subject: z.string().max(200).optional(),
});

const replySchema = z.object({
  threadId: z.string().min(1),
  body: z.string().min(1).max(4000),
});

export async function GET(req: Request) {
  const session = await getSession();
  const { searchParams } = new URL(req.url);
  const threadId = searchParams.get('threadId');

  if (session?.role === 'ADMIN') {
    if (threadId) {
      const thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { fullName: true, email: true } } },
          },
          user: { select: { fullName: true, email: true } },
        },
      });
      if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ thread });
    }
    const threads = await prisma.chatThread.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: 50,
      include: {
        user: { select: { fullName: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    return NextResponse.json({ threads });
  }

  if (!threadId) return NextResponse.json({ error: 'threadId required' }, { status: 400 });
  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (session && thread.userId && thread.userId !== session.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ thread });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const body = await req.json();

    // Admin reply → email the customer
    if (session?.role === 'ADMIN' && body.threadId && body.body && !body.email) {
      const parsed = replySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });

      const thread = await prisma.chatThread.findUnique({
        where: { id: parsed.data.threadId },
        include: { user: { select: { fullName: true, email: true } } },
      });
      if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });

      const msg = await prisma.chatMessage.create({
        data: {
          threadId: parsed.data.threadId,
          senderId: session.id,
          isAdmin: true,
          body: parsed.data.body,
        },
      });
      await prisma.chatThread.update({
        where: { id: parsed.data.threadId },
        data: { lastMessageAt: new Date(), status: 'OPEN' },
      });

      const customerEmail = thread.guestEmail || thread.user?.email || '';
      const customerName = thread.guestName || thread.user?.fullName || 'there';
      if (customerEmail) {
        await notifyUserChatReply({
          to: customerEmail,
          name: customerName,
          body: parsed.data.body,
          threadId: thread.id,
        });
      }

      return NextResponse.json({ ok: true, message: msg });
    }

    // Customer reply to existing thread → notify admin
    if (body.threadId && body.body && !body.email) {
      const parsed = replySchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
      const thread = await prisma.chatThread.findUnique({ where: { id: parsed.data.threadId } });
      if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
      const msg = await prisma.chatMessage.create({
        data: {
          threadId: parsed.data.threadId,
          senderId: session?.id,
          isAdmin: false,
          body: parsed.data.body,
        },
      });
      await prisma.chatThread.update({
        where: { id: parsed.data.threadId },
        data: { lastMessageAt: new Date() },
      });

      const guestName = thread.guestName || session?.fullName || 'Customer';
      const guestEmail = thread.guestEmail || session?.email || '';

      await notifyAdminNewChat({
        guestName,
        guestEmail,
        body: parsed.data.body,
        threadId: thread.id,
      });

      if (guestEmail) {
        await notifyUserChatReceived({
          to: guestEmail,
          name: guestName,
          body: parsed.data.body,
        });
      }

      return NextResponse.json({ ok: true, message: msg, threadId: thread.id });
    }

    // Start new chat → notify admin + confirm to user
    const parsed = startSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Name, email, and message required' }, { status: 400 });
    }

    const thread = await prisma.chatThread.create({
      data: {
        userId: session?.id,
        guestName: parsed.data.name,
        guestEmail: parsed.data.email.toLowerCase(),
        subject: parsed.data.subject || 'Support',
        messages: {
          create: {
            body: parsed.data.body,
            isAdmin: false,
            senderId: session?.id,
          },
        },
      },
    });

    await notifyAdminNewChat({
      guestName: parsed.data.name,
      guestEmail: parsed.data.email,
      body: parsed.data.body,
      threadId: thread.id,
    });

    await notifyUserChatReceived({
      to: parsed.data.email,
      name: parsed.data.name,
      body: parsed.data.body,
    });

    return NextResponse.json({ ok: true, threadId: thread.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
