'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';

export default function BookingCompletePage() {
  const searchParams = useSearchParams();
  const bookingCode = searchParams.get('bookingCode') || 'N/A';

  return (
    <main className="pb-0">
      <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[345px] top-0 z-0 bg-[#9FDDFF]"></div>
      <Header hamburgerColor="black" />
      <div className="relative w-full px-4 sm:px-6 md:px-0">
        <div className="flex flex-col items-center w-full max-w-[642px] text-center rounded-3xl p-6 sm:p-8 py-8 sm:py-12 md:py-16 lg:py-[85px] gap-4 sm:gap-6 bg-white mx-auto mt-8 sm:mt-12 md:mt-16 lg:mt-[120px]">
        <Image 
          src="/assets/images/icons/Success.svg" 
          alt="icon" 
          width={390} 
          height={390}
          className="flex shrink-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[390px] lg:h-[390px]"
        />
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <h1 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-[32px] leading-tight sm:leading-8 md:leading-10 tracking-[0.05em]">Booking Completed</h1>
          <p className="text-base sm:text-lg md:text-xl leading-6 sm:leading-7 md:leading-8 tracking-[1px] opacity-60 px-4">
            We will confirm your payment and update <br className="hidden sm:block" />
            the status to your email adress
          </p>
        </div>
        <div className="w-full sm:w-fit flex items-center justify-center rounded-2xl py-3 sm:py-4 px-4 sm:px-8 gap-3 sm:gap-4 bg-[#D0EEFF]">
          <Image src="/assets/images/icons/cart.svg" alt="icon" width={40} height={40} className="flex shrink-0 w-8 h-8 sm:w-10 sm:h-10" />
          <p className="font-['ClashDisplay-Semibold'] text-base sm:text-lg md:text-xl leading-tight sm:leading-[34px] tracking-[0.05em]">
            Your Booking ID:<span className="ml-2 text-fitcamp-purple">{bookingCode}</span>
          </p>
        </div>
        <Link 
          href="/view-subs" 
          className="w-full sm:w-fit rounded-full py-3 px-6 bg-fitcamp-royal-blue font-semibold leading-[19px] tracking-[0.05em] text-white text-center text-sm sm:text-base hover:opacity-90 transition-opacity"
        >
          View My Subscription
        </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}

