import { prisma } from '@/app/lib/prisma';
import AnimateOnScroll from './AnimateOnScroll';
import CityCardWrapper from './CityCardWrapper';

async function getCities() {
  try {
    const cities = await prisma.city.findMany({
      where: {
        thumbnailUrl: {
          not: null,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return cities;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
}

export default async function LocationSection() {
  const cities = await getCities();

  return (
    <section id="location" className="flex flex-col w-full max-w-[1280px] gap-6 md:gap-8 mx-auto px-4 sm:px-6 md:px-10 mt-12 md:mt-20 lg:mt-[120px]">
      <AnimateOnScroll animation="fadeInUp">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 md:gap-4">
            <h2 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight md:leading-[59px] tracking-[0.05em]">Gym Location</h2>
            <p className="leading-[19px] tracking-[0.03em] opacity-60 text-sm md:text-base">
              Find the nearby gym that near your location to transform your healthy journey
            </p>
          </div>
        </div>
      </AnimateOnScroll>
      <AnimateOnScroll animation="fadeInUp" delay={100}>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
        {cities.length === 0 ? (
          <p className="text-gray-500 text-sm">No cities available</p>
        ) : (
          cities.map((city, index) => (
            <CityCardWrapper
              key={city.id}
              id={city.id}
              name={city.name}
              slug={city.slug}
              thumbnailUrl={city.thumbnailUrl}
              index={index}
            />
          ))
        )}
        </div>
      </AnimateOnScroll>
    </section>
  );
}

