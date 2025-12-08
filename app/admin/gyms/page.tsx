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
    <div className="space-y-8 p-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Gyms</h1>
          <p className="text-gray-600 text-base">Manage gym locations</p>
        </div>
      </div>
      <GymsTable initialGyms={gyms} cities={cities} facilities={facilities} />
    </div>
  );
}

