import { prisma } from '@/app/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, CreditCard, Building2, Package } from 'lucide-react';

export default async function DashboardPage() {
  // Get statistics
  const [pendingOrders, waitingPayments, totalGyms, activePlans] = await Promise.all([
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({ where: { status: 'WAITING_PROOF' } }),
    prisma.gym.count(),
    prisma.subscriptionPlan.count({ where: { isActive: true } }),
  ]);

  const stats = [
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: ShoppingCart,
      description: 'Orders waiting for payment',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Waiting Payments',
      value: waitingPayments,
      icon: CreditCard,
      description: 'Payments waiting for approval',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Gyms',
      value: totalGyms,
      icon: Building2,
      description: 'Active gym locations',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Active Plans',
      value: activePlans,
      icon: Package,
      description: 'Subscription plans available',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-8 p-12">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600 text-base">Welcome to Fitcamp Admin Panel</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="rounded-[32px] shadow-sm border border-gray-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 px-6 pt-6">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-[32px] shadow-sm border border-gray-100">
          <CardHeader className="px-6 pt-6 pb-4">
            <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
            <CardDescription className="text-base mt-1">Common admin tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 px-6 pb-6">
            <a
              href="/admin/gyms"
              className="block p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Manage Gyms</div>
              <div className="text-sm text-gray-500 mt-1">Add, edit, or remove gym locations</div>
            </a>
            <a
              href="/admin/orders"
              className="block p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Review Orders</div>
              <div className="text-sm text-gray-500 mt-1">View and manage customer orders</div>
            </a>
            <a
              href="/admin/payments"
              className="block p-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">Approve Payments</div>
              <div className="text-sm text-gray-500 mt-1">Review and approve payment proofs</div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

