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
    <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Facilities</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage gym facilities</p>
      </div>
      <FacilitiesTable initialFacilities={facilities} />
    </div>
  );
}

