import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { UserRole } from '@/app/lib/generated/prisma/enums';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // If not authenticated or not admin, redirect to sign-in
  if (!session || session.user?.role !== UserRole.ADMIN) {
    redirect('/admin/sign-in');
  }

  // If authenticated and admin, redirect to dashboard
  redirect('/admin/dashboard');
}

