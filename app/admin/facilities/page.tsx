import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';
import FacilitiesTable from './components/FacilitiesTable';

export default async function FacilitiesPage() {
  await requireAdmin();

  const facilities = await prisma.facility.findMany({
    include: {
      _count: {
        select: {
          gyms: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Facilities</h1>
          <p className="text-gray-600 text-base">Manage gym facilities</p>
        </div>
      </div>
      <FacilitiesTable initialFacilities={facilities} />
    </div>
  );
}

