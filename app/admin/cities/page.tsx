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
    <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Cities</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage cities</p>
      </div>
      <CitiesTable initialCities={cities} />
    </div>
  );
}

