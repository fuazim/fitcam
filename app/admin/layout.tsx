import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@/app/lib/generated/prisma/enums';
import AdminSidebar from './components/AdminSidebar';
import { Toaster } from '@/components/ui/sonner';
import { headers } from 'next/headers';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || headersList.get('referer') || '';
  
  // Skip auth check for sign-in page
  if (pathname.includes('/admin/sign-in')) {
    return <>{children}</>;
  }
  
  const session = await getServerSession(authOptions);

  // Redirect to sign-in if not authenticated
  if (!session) {
    redirect('/admin/sign-in');
  }

  // Redirect to sign-in if not admin
  if (session.user?.role !== UserRole.ADMIN) {
    redirect('/admin/sign-in');
  }

  return (
    <div className="min-h-screen bg-fitcamp-bg">
      <AdminSidebar user={session.user} />
      <div className="lg:pl-64">
        <main className="p-12 sm:p-8 lg:pl-20 lg:pr-8 lg:pt-10 lg:pb-12 xl:pl-24 xl:pr-12">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}

