import Link from 'next/link';
import GymCardWrapper from './GymCardWrapper';
import { prisma } from '../lib/prisma';
import AnimateOnScroll from './AnimateOnScroll';

async function getLatestGyms() {
  const gyms = await prisma.gym.findMany({
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
      { createdAt: 'desc' },
    ],
    take: 6,
  });

  return gyms.map((gym) => ({
    id: gym.id,
    slug: gym.slug,
    name: gym.name,
    location: gym.locationText,
    thumbnail: gym.thumbnailUrl || gym.images[0]?.url || '',
  }));
}

export default async function LatestSection() {
  const gyms = await getLatestGyms();

  return (
    <section id="latest" className="flex flex-col w-full max-w-[1280px] gap-6 md:gap-8 mx-auto px-4 sm:px-6 md:px-10 mt-12 md:mt-20 lg:mt-[120px]">
      <AnimateOnScroll animation="fadeInUp">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2 md:gap-4">
            <h2 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight md:leading-[59px] tracking-[0.05em]">Latest Added</h2>
            <p className="leading-[19px] tracking-[0.03em] opacity-60 text-sm md:text-base">
              New gyms added from around the city with variety facilities available
            </p>
          </div>
          <Link href="/location-result" className="w-fit rounded-full py-3 md:py-4 px-4 md:px-6 bg-fitcamp-black text-white text-sm md:text-base">
            See All
          </Link>
        </div>
      </AnimateOnScroll>
      <AnimateOnScroll animation="fadeInUp" delay={150}>
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
          <p className="col-span-full text-center text-gray-500 py-8">No gyms available yet</p>
        )}
        </div>
      </AnimateOnScroll>
    </section>
  );
}

