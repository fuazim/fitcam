import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';
import OrdersTable from './components/OrdersTable';

export default async function OrdersPage() {
  await requireAdmin();

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      plan: true,
      gym: {
        select: {
          id: true,
          name: true,
          locationText: true,
        },
      },
      payment: true,
      ticket: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage customer orders</p>
      </div>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}

