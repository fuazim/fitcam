'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/location-result?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="relative flex flex-col w-full h-auto min-h-[600px] md:h-[800px] lg:h-[1164px] overflow-hidden -mb-[140px] pb-[140px]">
      <Image 
        src="/assets/images/backgrounds/Header Illustration.svg" 
        alt="background" 
        fill
        className="absolute w-full h-full object-cover"
        priority
      />
      <div className="relative">
        <Header hamburgerColor="black" menuTextColor="black" />
      </div>
      <div id="hero-text" className="relative flex flex-col items-center mx-auto mt-8 md:mt-16 lg:mt-[96px] px-4">
        <div className="hero-badge flex items-center w-fit rounded-[38px] p-2 pr-4 md:pr-6 gap-2 md:gap-3 bg-fitcamp-black">
          <Image 
            src="/assets/images/photos/triple-photo.png" 
            alt="photos" 
            width={88} 
            height={40}
            className="flex shrink-0 w-16 md:w-20 lg:w-[88px] h-auto"
            unoptimized
          />
          <p className="leading-[19px] text-white text-xs md:text-sm lg:text-base">Over <span className="font-semibold">100K+</span> Member Joined</p>
        </div>
        <h1 className="hero-title font-['ClashDisplay-Bold'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[78px] text-white mt-4 text-center px-4">Prioritize Your Health</h1>
        <p className="hero-subtitle leading-[19px] text-white text-sm md:text-base mt-2 text-center px-4">Transform Your Life by Investing in Your Wellness</p>
        <form onSubmit={handleSearch} className="hero-search flex items-center w-full max-w-[487px] rounded-[53px] p-2 pl-4 md:pl-6 gap-4 md:gap-6 bg-white mt-6 md:mt-[38px] mx-4">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="appearance-none outline-none !bg-white w-full leading-[19px] font-semibold placeholder:text-[#3F3F3F80] text-sm md:text-base" 
            placeholder="Search gym location, city nearby..."
          />
          <button type="submit" className="rounded-[48px] py-3 md:py-4 px-4 md:px-6 bg-fitcamp-black font-semibold leading-[19px] text-white text-sm md:text-base whitespace-nowrap">
            Search
          </button>
        </form>
      </div>
    </header>
  );
}

