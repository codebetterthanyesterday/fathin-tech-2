import { Metadata } from 'next';
import { getSession } from '@/lib/auth';
import AdminShell from '@/components/admin/layout/admin-shell';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return <AdminShell email={session?.email || null}>{children}</AdminShell>;
}
