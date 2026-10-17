import { getSession } from '@/lib/auth';
import { SiteNav } from '@/components/SiteNav';

export async function Header() {
  const session = await getSession();

  return (
    <SiteNav
      session={
        session
          ? { fullName: session.fullName, role: session.role }
          : null
      }
    />
  );
}
