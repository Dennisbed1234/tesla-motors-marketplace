import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DEFAULT_PAYMENT_METHODS, PAYMENT_METHODS_KEY, type PaymentMethodsConfig } from '@/lib/payments';
import { PaymentMethodsEditor } from '@/components/PaymentMethodsEditor';

export const dynamic = 'force-dynamic';

export default async function AdminPaymentsPage() {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/account');

  let config: PaymentMethodsConfig = DEFAULT_PAYMENT_METHODS;
  try {
    const row = await prisma.siteContent.findUnique({ where: { key: PAYMENT_METHODS_KEY } });
    if (row?.body) config = { ...DEFAULT_PAYMENT_METHODS, ...JSON.parse(row.body) };
  } catch {
    config = DEFAULT_PAYMENT_METHODS;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Payment methods</h1>
          <p className="mt-1 text-sm text-ink-400">Ops — enable methods and edit crypto addresses shown to customers.</p>
        </div>
        <Link href="/admin" className="text-sm text-ink-400 hover:text-white">← Dashboard</Link>
      </div>
      <PaymentMethodsEditor initial={config} />
    </div>
  );
}
