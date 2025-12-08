'use client';

import Image from 'next/image';
import AnimateOnScroll from './AnimateOnScroll';

interface BenefitCardWrapperProps {
  icon: string;
  title: string;
  description: string;
  index: number;
}

export default function BenefitCardWrapper({ icon, title, description, index }: BenefitCardWrapperProps) {
  return (
    <AnimateOnScroll animation="fadeInUp" delay={150 + (index * 100)}>
      <div className="flex flex-col items-center text-center gap-3 md:gap-4 transition-all duration-300 hover:scale-105">
        <Image 
          src={icon} 
          alt={title} 
          width={120} 
          height={120}
          className="w-20 h-20 md:w-24 md:h-24 lg:w-[120px] lg:h-[120px]"
        />
        <h3 className="font-['ClashDisplay-Semibold'] text-lg md:text-xl leading-6 tracking-[0.05em]">
          {title}
        </h3>
        <p className="tracking-[0.03em] text-sm md:text-base">
          {description.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i < description.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      </div>
    </AnimateOnScroll>
  );
}

