'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from './AnimateOnScroll';

const testimonials = [
  {
    text: "I've been a member of this gym for six months, and it's been a game-changer! The trainers are incredibly knowledgeable and supportive",
    name: 'Tatang Sutarman',
    role: 'Product Manager',
    image: '/assets/images/photos/Image-1.png',
  },
  {
    text: "The facilities here are top-notch and always clean. I love the variety of equipment and the friendly atmosphere. Best fitness investment I've made!",
    name: 'Sarah Wijaya',
    role: 'Marketing Director',
    image: '/assets/images/photos/Image-2.png',
  },
  {
    text: "Joining this gym transformed my fitness journey completely. The community is amazing and the trainers push you to achieve your best. Highly recommended!",
    name: 'Budi Santoso',
    role: 'Software Engineer',
    image: '/assets/images/photos/Image-3.png',
  },
];

export default function TestimonialSection() {
  const swiperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && swiperRef.current && (window as any).Swiper) {
      const swiperAlumnus = new (window as any).Swiper(swiperRef.current, {
        effect: 'fade',
        fadeEffect: {
          crossFade: true
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          renderBullet: function (index: number, className: string) {
            return '<div class="relative group !flex !shrink-0 !w-16 !h-16 ![background:none] ' + className + ' transition-all duration-300">' 
                      + '<img src="/assets/images/photos/Image-'+(index+1)+'.png" class="w-full h-full object-cover !rounded-full !overflow-hidden" alt="photo">' 
                  + "</div>";
          },
          bulletActiveClass: 'swiper-pagination-bullet-active'
        },
      });
    } else if (typeof window !== 'undefined' && swiperRef.current) {
      // Wait for Swiper to load from CDN
      const checkSwiper = setInterval(() => {
        if ((window as any).Swiper) {
          clearInterval(checkSwiper);
          const swiperAlumnus = new (window as any).Swiper(swiperRef.current, {
            effect: 'fade',
            fadeEffect: {
              crossFade: true
            },
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
              renderBullet: function (index: number, className: string) {
                return '<div class="relative group !flex !shrink-0 !w-16 !h-16 ![background:none] ' + className + ' transition-all duration-300">' 
                          + '<img src="/assets/images/photos/Image-'+(index+1)+'.png" class="w-full h-full object-cover !rounded-full !overflow-hidden" alt="photo">' 
                      + "</div>";
              },
              bulletActiveClass: 'swiper-pagination-bullet-active'
            },
          });
        }
      }, 100);
      
      // Cleanup after 10 seconds
      setTimeout(() => clearInterval(checkSwiper), 10000);
    }
  }, []);

  return (
    <section id="testi" className="flex flex-col gap-6 md:gap-8 mt-12 md:mt-20 lg:mt-[120px]">
      <AnimateOnScroll animation="fadeInUp">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 gap-4">
          <div className="flex flex-col gap-2 md:gap-4">
            <h2 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight md:leading-[59px] tracking-[0.05em]">
              Joined 10.000+ User <br className="hidden md:block" />with Happy Story
            </h2>
          </div>
          <Link href="#" className="w-fit rounded-full py-3 md:py-4 px-4 md:px-6 bg-fitcamp-black text-white text-sm md:text-base">
            See All
          </Link>
        </div>
      </AnimateOnScroll>
      <AnimateOnScroll animation="fadeIn" delay={200}>
        <div ref={swiperRef} className="swiper w-full">
        <div className="swiper-wrapper">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="swiper-slide w-full">
              <div className="flex flex-col items-center w-full max-w-[1069px] rounded-[32px] py-8 md:py-12 lg:py-[56px] px-4 sm:px-6 md:px-12 lg:px-[72px] gap-6 md:gap-8 lg:gap-12 mx-auto bg-white">
                <p className="text-lg sm:text-xl md:text-2xl lg:text-[32px] tracking-[0.05em] text-center">
                  {testimonial.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < testimonial.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </p>
                <div className="flex items-center gap-3 w-fit">
                  <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden">
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      width={64} 
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:gap-2">
                    <p className="font-['ClashDisplay-Semibold'] text-lg md:text-xl lg:text-2xl leading-tight md:leading-[29.52px] tracking-[0.05em]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm md:text-base lg:text-xl leading-6 tracking-[0.05em] opacity-50">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="swiper-pagination !relative flex items-center justify-center gap-2 md:gap-4 mt-6 md:mt-[50px] h-[60px] md:h-[70px]"></div>
        </div>
      </AnimateOnScroll>
    </section>
  );
}

