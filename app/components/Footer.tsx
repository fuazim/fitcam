import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="flex flex-col w-full max-w-[1312px] mx-auto rounded-t-[32px] md:rounded-[32px] bg-black p-6 sm:p-8 md:p-12 lg:p-[120px] mt-12 md:mt-20 lg:mt-[120px] mb-0 md:mb-16">
      <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12 lg:gap-16">
        <div className="flex flex-col gap-4 md:gap-6 max-w-full md:max-w-[306px] text-start">
          <Image 
            src="/assets/images/logos/Logo-2.svg" 
            alt="Fitcamp Logo" 
            width={120} 
            height={48}
            className="h-10 md:h-12 w-fit"
          />
          <p className="tracking-[0.03em] text-white text-sm md:text-base">
            Largest gym in Indonesia, top-tier facilities, premium amenities, and nationwide access to all gym location
          </p>
        </div>
        <nav className="flex flex-col sm:flex-row gap-8 sm:gap-12 md:gap-16 justify-end text-white">
          <ul className="flex flex-col gap-3 md:gap-4">
            <p className="font-semibold tracking-[0.03em] text-sm md:text-base">More to Know</p>
            <li>
              <Link href="#" className="tracking-[0.03em] text-sm md:text-base">Blog</Link>
            </li>
            <li>
              <Link href="/subscription-list" className="tracking-[0.03em] text-sm md:text-base">Subscription</Link>
            </li>
            <li>
              <Link href="#" className="tracking-[0.03em] text-sm md:text-base">Testimonial</Link>
            </li>
            <li>
              <Link href="#" className="tracking-[0.03em] text-sm md:text-base">About</Link>
            </li>
          </ul>
          <ul className="flex flex-col gap-3 md:gap-4">
            <p className="font-semibold tracking-[0.03em] text-sm md:text-base">Contact Us</p>
            <li>
              <Link href="#" className="tracking-[0.03em] text-sm md:text-base">021 543 545 676</Link>
            </li>
            <li>
              <Link href="#" className="tracking-[0.03em] text-sm md:text-base">@fitcamp.bodyfit</Link>
            </li>
            <li>
              <Link href="#" className="tracking-[0.03em] text-sm md:text-base">admin@fitcamp.com</Link>
            </li>
          </ul>
        </nav>
      </div>
      <hr className="border-white/50 mt-8 md:mt-12 lg:mt-16" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 md:mt-8 lg:mt-[30px]">
        <p className="font-semibold tracking-[0.03em] text-white text-sm md:text-base">© 2024 fitcampcorporation</p>
        <ul className="flex items-center justify-start sm:justify-end gap-4 md:gap-6 text-white flex-wrap">
          <li>
            <Link href="#" className="tracking-[0.03em] text-xs md:text-sm">Term of Services</Link>
          </li>
          <li>
            <Link href="#" className="tracking-[0.03em] text-xs md:text-sm">Privacy Policy</Link>
          </li>
          <li>
            <Link href="#" className="tracking-[0.03em] text-xs md:text-sm">Cookies</Link>
          </li>
          <li>
            <Link href="#" className="tracking-[0.03em] text-xs md:text-sm">Legal</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}

