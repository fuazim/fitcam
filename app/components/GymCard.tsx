'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface GymCardProps {
  name: string;
  location: string;
  thumbnail: string;
  id: string;
  slug?: string;
}

export default function GymCard({ name, location, thumbnail, id, slug }: GymCardProps) {
  const router = useRouter();
  // Generate slug from name if not provided
  const gymSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  const handleViewAllClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/details/${gymSlug}`);
  };
  
  return (
    <Link href={`/details/${gymSlug}`} className="card group">
      <div className="flex flex-col rounded-3xl p-4 sm:p-6 md:p-8 gap-4 md:gap-6 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="title flex flex-col gap-2">
          <h3 className="font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm md:text-base">{name}</h3>
          <div className="flex items-center gap-1">
            <Image 
              src="/assets/images/icons/location.svg" 
              alt="icon" 
              width={16} 
              height={16}
              className="flex shrink-0 w-3 h-3 md:w-4 md:h-4"
            />
            <p className="text-xs md:text-sm leading-[19px] tracking-[0.03em] opacity-50">{location}</p>
          </div>
        </div>
        <div className="thumbnail flex rounded-3xl h-[150px] sm:h-[180px] md:h-[200px] bg-fitcamp-dark-blue overflow-hidden">
          <Image 
            src={thumbnail} 
            alt="thumbnail" 
            width={400} 
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="font-['ClashDisplay-Semibold'] text-sm md:text-base">Facilities</p>
          <button 
            onClick={handleViewAllClick}
            className="font-semibold text-xs leading-[14px] tracking-[0.05em] text-fitcamp-royal-blue cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0"
          >
            View all
          </button>
        </div>
        <div className="grid grid-cols-3 justify-between gap-2 md:gap-3">
          <div className="flex flex-col gap-2 md:gap-3 items-center text-center">
            <Image src="/assets/images/icons/Sauna.svg" alt="icon" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-xs md:text-sm leading-[16px] tracking-[0.05em]">Sauna</p>
              <p className="opacity-50 text-xs md:text-sm leading-[16px] tracking-[0.05em]">Relax Body</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:gap-3 items-center text-center">
            <Image src="/assets/images/icons/Shower Room.svg" alt="icon" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-xs md:text-sm leading-[16px] tracking-[0.05em]">Shower</p>
              <p className="opacity-50 text-xs md:text-sm leading-[16px] tracking-[0.05em]">After Gym</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:gap-3 items-center text-center">
            <Image src="/assets/images/icons/Locker.svg" alt="icon" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
            <div className="flex flex-col gap-1">
              <p className="font-semibold text-xs md:text-sm leading-[16px] tracking-[0.05em]">Locker</p>
              <p className="opacity-50 text-xs md:text-sm leading-[16px] tracking-[0.05em]">Saving Bag</p>
            </div>
          </div>
        </div>
        <hr className="border-black/10" />
        <div className="flex items-center gap-2 md:gap-3">
          <Image src="/assets/images/icons/Daily Time.svg" alt="icon" width={40} height={40} className="w-8 h-8 md:w-10 md:h-10" />
          <div className="flex flex-col gap-1 md:gap-2">
            <p className="font-['ClashDisplay-Semibold'] text-xs md:text-sm leading-[17px] tracking-[0.05em]">Opening Work</p>
            <p className="text-xs leading-[14px] tracking-[0.05em] opacity-50">08:00 AM - 09:00 PM</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

