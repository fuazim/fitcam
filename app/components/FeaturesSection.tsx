import Image from 'next/image';
import AnimateOnScroll from './AnimateOnScroll';

export default function FeaturesSection() {
  return (
    <section id="features" className="relative w-full max-w-[1280px] h-auto min-h-[280px] mx-auto px-4 sm:px-6 md:px-10 mt-8 md:mt-0">
      <AnimateOnScroll animation="fadeInUp">
        <div className="flex flex-col md:flex-row items-center justify-center w-full rounded-3xl p-6 md:p-10 gap-8 md:gap-12 lg:gap-16 bg-white shadow-[8px_12px_28px_0_#0000000D]">
        <div className="flex flex-col items-center w-full md:w-[282px] gap-4 text-center">
          <Image 
            src="/assets/images/icons/Located.svg" 
            alt="icon" 
            width={72} 
            height={72}
            className="flex shrink-0 w-16 md:w-20 lg:w-[72px] h-auto"
          />
          <h3 className="font-['ClashDisplay-Semibold'] text-lg md:text-xl leading-6 tracking-[0.05em]">Find Nearby Location</h3>
          <p className="tracking-[0.03em] text-sm md:text-base">
            Find the nearby gym that <br className="hidden md:block" />
            near your location to transform <br className="hidden md:block" />
            your healthy journey.
          </p>
        </div>
        <div className="flex flex-col items-center w-full md:w-[282px] gap-4 text-center">
          <Image 
            src="/assets/images/icons/coupon-dollar.svg" 
            alt="icon" 
            width={72} 
            height={72}
            className="flex shrink-0 w-16 md:w-20 lg:w-[72px] h-auto"
          />
          <h3 className="font-['ClashDisplay-Semibold'] text-lg md:text-xl leading-6 tracking-[0.05em]">Become Membership</h3>
          <p className="tracking-[0.03em] text-sm md:text-base">
            Access to all fitcamp gym <br className="hidden md:block" />
            and become part of our exclusive <br className="hidden md:block" />
            healty community.
          </p>
        </div>
        <div className="flex flex-col items-center w-full md:w-[282px] gap-4 text-center">
          <Image 
            src="/assets/images/icons/Muscle.svg" 
            alt="icon" 
            width={72} 
            height={72}
            className="flex shrink-0 w-16 md:w-20 lg:w-[72px] h-auto"
          />
          <h3 className="font-['ClashDisplay-Semibold'] text-lg md:text-xl leading-6 tracking-[0.05em]">Maintain the Body</h3>
          <p className="tracking-[0.03em] text-sm md:text-base">
            Ensure long-term wellness <br className="hidden md:block" />
            with effective healty body <br className="hidden md:block" />
            maintenance strategies
          </p>
        </div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}

