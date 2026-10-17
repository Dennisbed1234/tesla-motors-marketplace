import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import {
  DEFAULT_PAYMENT_METHODS,
  PAYMENT_METHODS_KEY,
  type PaymentMethodsConfig,
} from '@/lib/payments';

async function loadConfig(): Promise<PaymentMethodsConfig> {
  const row = await prisma.siteContent.findUnique({ where: { key: PAYMENT_METHODS_KEY } });
  if (!row?.body) return DEFAULT_PAYMENT_METHODS;
  try {
    return { ...DEFAULT_PAYMENT_METHODS, ...JSON.parse(row.body) } as PaymentMethodsConfig;
  } catch {
    return DEFAULT_PAYMENT_METHODS;
  }
}

export async function GET() {
  const config = await loadConfig();
  return NextResponse.json({ config });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const config: PaymentMethodsConfig = {
      creditDebitEnabled: !!body.creditDebitEnabled,
      wireEnabled: !!body.wireEnabled,
      cryptoEnabled: !!body.cryptoEnabled,
      wireInstructions: String(body.wireInstructions || ''),
      crypto: Array.isArray(body.crypto)
        ? body.crypto.map((c: { id?: string; label?: string; address?: string }) => ({
            id: String(c.id || cryptoRandom()),
            label: String(c.label || ''),
            address: String(c.address || '').trim(),
          }))
        : DEFAULT_PAYMENT_METHODS.crypto,
    };

    await prisma.siteContent.upsert({
      where: { key: PAYMENT_METHODS_KEY },
      update: {
        title: 'Payment methods',
        body: JSON.stringify(config),
      },
      create: {
        key: PAYMENT_METHODS_KEY,
        title: 'Payment methods',
        body: JSON.stringify(config),
      },
    });

    await prisma.auditLog
      .create({
        data: {
          adminId: session.id,
          action: 'PAYMENT_METHODS_UPDATED',
          entityType: 'SiteContent',
          entityId: PAYMENT_METHODS_KEY,
        },
      })
      .catch(() => null);

    return NextResponse.json({ ok: true, config });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

function cryptoRandom() {
  return 'net_' + Math.random().toString(36).slice(2, 9);
}
