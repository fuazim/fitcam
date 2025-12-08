'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

interface HeaderProps {
  hamburgerColor?: 'white' | 'black';
  menuTextColor?: 'white' | 'black';
}

export default function Header({ hamburgerColor = 'black', menuTextColor = 'black' }: HeaderProps) {
  // Always use black text for menu links unless explicitly set to white
  const linkColor = menuTextColor === 'white' ? 'text-white' : 'text-[#141414]';
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="relative flex flex-col items-center justify-between w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 pt-6 md:pt-10">
      <div className="flex items-center justify-between w-full">
        <Link href="/" onClick={closeMenu}>
          <Image 
            src="/assets/images/logos/Logo.svg" 
            alt="Fitcamp Logo" 
            width={120} 
            height={40}
            className="flex shrink-0 w-20 sm:w-24 md:w-[120px] h-auto"
          />
        </Link>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-4 lg:gap-6 justify-end">
          <li>
            <Link href="/subscription-list" className={`leading-[19px] tracking-[0.03em] ${linkColor} text-sm lg:text-base hover:opacity-70 transition-opacity`}>
              Subscribe Plan
            </Link>
          </li>
          <li>
            <Link href="/blog" className={`leading-[19px] tracking-[0.03em] ${linkColor} text-sm lg:text-base hover:opacity-70 transition-opacity`}>
              Blog
            </Link>
          </li>
          <li>
            <Link href="/#testi" className={`leading-[19px] tracking-[0.03em] ${linkColor} text-sm lg:text-base hover:opacity-70 transition-opacity`}>
              Testimonial
            </Link>
          </li>
          <li>
            <Link href="/about" className={`leading-[19px] tracking-[0.03em] ${linkColor} text-sm lg:text-base hover:opacity-70 transition-opacity`}>
              About
            </Link>
          </li>
          <li>
            <Link href="/view-subs" className="leading-[19px] tracking-[0.05em] text-white font-semibold rounded-[22px] py-2 px-4 lg:py-3 lg:px-6 bg-fitcamp-royal-blue text-sm lg:text-base hover:opacity-90 transition-opacity">
              My Subscription
            </Link>
          </li>
        </ul>

        {/* Hamburger Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 z-[100] relative"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            // Close Icon (X)
            <svg
              className={`w-6 h-6 ${hamburgerColor === 'white' ? 'text-white' : 'text-[#141414]'}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Icon
            <svg
              className={`w-6 h-6 ${hamburgerColor === 'white' ? 'text-white' : 'text-[#141414]'}`}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-white/95 backdrop-blur-sm z-[90] transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <div className="flex flex-col h-full w-full pt-6 md:pt-10 px-4 sm:px-6">
          {/* Logo and Close Button */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={closeMenu}>
              <Image 
                src="/assets/images/logos/Logo.svg" 
                alt="Fitcamp Logo" 
                width={120} 
                height={40}
                className="flex shrink-0 w-20 sm:w-24 md:w-[120px] h-auto"
              />
            </Link>
            <button
              onClick={closeMenu}
              className="flex items-center justify-center w-8 h-8"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6 text-[#141414]"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ul className="flex flex-col gap-6">
            <li>
              <Link
                href="/subscription-list"
                onClick={closeMenu}
                className="block leading-[19px] tracking-[0.03em] text-[#141414] text-lg py-3 hover:opacity-70 transition-opacity"
              >
                Subscribe Plan
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                onClick={closeMenu}
                className="block leading-[19px] tracking-[0.03em] text-[#141414] text-lg py-3 hover:opacity-70 transition-opacity"
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href="/#testi"
                onClick={closeMenu}
                className="block leading-[19px] tracking-[0.03em] text-[#141414] text-lg py-3 hover:opacity-70 transition-opacity"
              >
                Testimonial
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                onClick={closeMenu}
                className="block leading-[19px] tracking-[0.03em] text-[#141414] text-lg py-3 hover:opacity-70 transition-opacity"
              >
                About
              </Link>
            </li>
            <li className="mt-4">
              <Link
                href="/view-subs"
                onClick={closeMenu}
                className="block leading-[19px] tracking-[0.05em] text-white font-semibold rounded-[22px] py-3 px-6 bg-fitcamp-royal-blue text-base text-center hover:opacity-90 transition-opacity"
              >
                My Subscription
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

