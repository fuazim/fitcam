'use client';

import Link from 'next/link';
import Image from 'next/image';
import AnimateOnScroll from './AnimateOnScroll';

interface CityCardWrapperProps {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  index: number;
}

export default function CityCardWrapper({ id, name, slug, thumbnailUrl, index }: CityCardWrapperProps) {
  return (
    <AnimateOnScroll animation="scaleIn" delay={150 + (index * 50)}>
      <Link href={`/location-result?city=${slug}`}>
        <div className="flex items-center rounded-full p-2 md:p-3 pr-4 md:pr-6 gap-2 md:gap-3 bg-white transition-all duration-300 hover:shadow-md hover:scale-105">
          <div className="w-8 h-8 md:w-10 md:h-10 flex shrink-0 rounded-full overflow-hidden relative">
            {thumbnailUrl ? (
              <Image 
                src={thumbnailUrl} 
                alt={name} 
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-xs">{name.charAt(0)}</span>
              </div>
            )}
          </div>
          <span className="leading-[19px] tracking-[0.03em] text-sm md:text-base">{name}</span>
        </div>
      </Link>
    </AnimateOnScroll>
  );
}

