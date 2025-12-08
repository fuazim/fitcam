import Header from '../components/Header';
import Footer from '../components/Footer';
import GymCardWrapper from '../components/GymCardWrapper';
import { prisma } from '../lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import AnimateOnScroll from '../components/AnimateOnScroll';
import ToTopButton from '../components/ToTopButton';
import CityCardWrapper from '../components/CityCardWrapper';

async function getCitiesWithGyms() {
  const cities = await prisma.city.findMany({
    where: {
      thumbnailUrl: {
        not: null,
      },
      gyms: {
        some: {},
      },
    },
    include: {
      _count: {
        select: {
          gyms: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
  return cities;
}

async function getGymsByCity(citySlug: string | null, searchQuery: string | null) {
  const where: any = {};

  // Filter by city
  if (citySlug) {
    const city = await prisma.city.findUnique({
      where: { slug: citySlug },
    });
    if (city) {
      where.cityId = city.id;
    } else {
      return { city: null, gyms: [], searchQuery: null };
    }
  }

  // Search query
  if (searchQuery && searchQuery.trim()) {
    where.OR = [
      { name: { contains: searchQuery, mode: 'insensitive' } },
      { locationText: { contains: searchQuery, mode: 'insensitive' } },
      { address: { contains: searchQuery, mode: 'insensitive' } },
    ];
  }

  const city = citySlug
    ? await prisma.city.findUnique({
        where: { slug: citySlug },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      })
    : null;

  const gyms = await prisma.gym.findMany({
    where,
    include: {
      city: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
        take: 1,
      },
    },
    orderBy: [
      { isPopular: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return {
    city: city || null,
    gyms: gyms.map((gym) => ({
      id: gym.id,
      slug: gym.slug,
      name: gym.name,
      location: gym.locationText,
      thumbnail: gym.thumbnailUrl || gym.images[0]?.url || '',
    })),
    searchQuery: searchQuery || null,
  };
}

export default async function LocationResultPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; q?: string }>;
}) {
  const params = await searchParams;
  const citySlug = params?.city || null;
  const searchQuery = params?.q || null;
  const [cities, { city, gyms, searchQuery: query }] = await Promise.all([
    getCitiesWithGyms(),
    getGymsByCity(citySlug, searchQuery),
  ]);

  // Determine title and description based on search or city filter
  let title = 'All Cities';
  let description = 'Find FitCamp gym locations';

  if (query) {
    title = `Search Results`;
    description = `Search results for "${query}"`;
  } else if (city) {
    title = city.name;
    description = `Finding FitCamp gym location nearby "${city.name}" city`;
  }

  return (
    <main className="pb-0">
      <Header hamburgerColor="black" />
      <section id="latest" className="flex flex-col w-full max-w-[1280px] gap-6 md:gap-8 mx-auto px-4 sm:px-6 md:px-10 mt-12 md:mt-20 lg:mt-[120px] mb-8 md:mb-16">
        <AnimateOnScroll animation="fadeInUp">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 md:gap-4">
              <h2 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight md:leading-[59px] tracking-[0.05em]">{title}</h2>
              <p className="leading-[19px] tracking-[0.03em] opacity-60 text-sm md:text-base">
                {description}
              </p>
            </div>
          </div>
        </AnimateOnScroll>
        {cities.length > 0 && (
          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <div className="flex flex-col gap-3 md:gap-4 mt-2 md:mt-4">
              <h3 className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl md:text-2xl leading-tight tracking-[0.05em]">Filter by City</h3>
              <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                <AnimateOnScroll animation="scaleIn" delay={150}>
                  <Link 
                    href="/location-result"
                    className={`flex items-center rounded-full py-3 md:py-4.5 px-5 md:px-9 gap-2 md:gap-3 transition-all min-h-[48px] md:min-h-[60px] ${
                      !citySlug 
                        ? 'bg-fitcamp-royal-blue text-white' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="leading-[19px] tracking-[0.03em] text-sm md:text-base">All Cities</span>
                  </Link>
                </AnimateOnScroll>
                {cities.map((cityItem, index) => (
                  <CityCardWrapper
                    key={cityItem.id}
                    id={cityItem.id}
                    name={cityItem.name}
                    slug={cityItem.slug}
                    thumbnailUrl={cityItem.thumbnailUrl}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        )}
        <AnimateOnScroll animation="fadeInUp" delay={200}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {gyms.length > 0 ? (
              gyms.map((gym, index) => (
                <GymCardWrapper 
                  key={gym.id} 
                  name={gym.name} 
                  location={gym.location} 
                  thumbnail={gym.thumbnail} 
                  id={gym.id} 
                  slug={gym.slug}
                  index={index}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <p className="text-lg font-medium text-gray-500 mb-2">
                  {query ? `No gyms found for "${query}"` : 'No gyms found'}
                </p>
                <p className="text-sm text-gray-400">
                  {query ? 'Try searching with different keywords' : 'Try selecting a different city'}
                </p>
              </div>
            )}
          </div>
        </AnimateOnScroll>
      </section>
      <Footer />
      <ToTopButton />
    </main>
  );
}

