import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';
import PaymentsTable from './components/PaymentsTable';

export default async function PaymentsPage() {
  await requireAdmin();

  const payments = await prisma.payment.findMany({
    where: {
      status: 'WAITING_PROOF',
    },
    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-sm sm:text-base text-gray-600">Review and approve payment proofs</p>
      </div>
      <PaymentsTable initialPayments={payments} />
    </div>
  );
}

