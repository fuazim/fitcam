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
    <div className="space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Payments</h1>
          <p className="text-gray-600 text-base">Review and approve payment proofs</p>
        </div>
      </div>
      <PaymentsTable initialPayments={payments} />
    </div>
  );
}

