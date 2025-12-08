import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';
import CitiesTable from './components/CitiesTable';

export default async function CitiesPage() {
  await requireAdmin();

  const cities = await prisma.city.findMany({
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Cities</h1>
          <p className="text-gray-600 text-base">Manage cities</p>
        </div>
      </div>
      <CitiesTable initialCities={cities} />
    </div>
  );
}

