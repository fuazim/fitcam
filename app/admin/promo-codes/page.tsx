import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';
import PromoCodesTable from './components/PromoCodesTable';

export default async function PromoCodesPage() {
  await requireAdmin();

  const promoCodes = await prisma.promoCode.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Promo Codes</h1>
          <p className="text-gray-600 text-base">Manage discount codes and promotions</p>
        </div>
      </div>
      <PromoCodesTable initialPromoCodes={promoCodes} />
    </div>
  );
}

