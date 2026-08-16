import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getAdminSlug } from '@/lib/routes';
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
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ adminSlug: string }>;
}) {
  const { adminSlug } = await params;
  const expectedSlug = getAdminSlug();

  // If the URL segment does not match the configured secret route, return standard 404
  if (adminSlug !== expectedSlug) {
    notFound();
  }

  const session = await getSession();

  return <AdminShell email={session?.email || null}>{children}</AdminShell>;
}

