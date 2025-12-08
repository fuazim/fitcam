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
    <div className="space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600 text-base">View and manage customer orders</p>
        </div>
      </div>
      <OrdersTable initialOrders={orders} />
    </div>
  );
}

