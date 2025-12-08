import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';
import GymsTable from './components/GymsTable';

export default async function GymsPage() {
  await requireAdmin();

  const gyms = await prisma.gym.findMany({
    include: {
      city: true,
      images: {
        orderBy: { sortOrder: 'asc' },
      },
      facilities: {
        include: {
          facility: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const cities = await prisma.city.findMany({
    orderBy: { name: 'asc' },
  });

  const facilities = await prisma.facility.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Gyms</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage gym locations</p>
      </div>
      <GymsTable initialGyms={gyms} cities={cities} facilities={facilities} />
    </div>
  );
}

