'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import ToTopButton from '../../components/ToTopButton';

interface Facility {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  imageUrl: string | null;
}

interface Gym {
  id: string;
  slug: string;
  name: string;
  location: string;
  thumbnail: string;
  mainImage: string;
  images: string[];
  address: string | null;
  isPopular: boolean;
  city: {
    id: string;
    name: string;
    slug: string;
  };
  openingHours: string | null;
  facilities: Facility[];
  latitude: number | null;
  longitude: number | null;
  contactPersonName: string | null;
  contactPersonPhone: string | null;
}

export default function DetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [gym, setGym] = useState<Gym | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainThumbnail, setMainThumbnail] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Use images from database, fallback to mainImage/thumbnail if no images array
  const allImages = gym?.images && gym.images.length > 0 
    ? gym.images 
    : (gym?.mainImage || gym?.thumbnail ? [gym.mainImage || gym.thumbnail] : []);

  // First image is default for main thumbnail, rest (max 4) for gallery
  const defaultMainImage = allImages[0] || '';

  useEffect(() => {
    const fetchGym = async () => {
      try {
        const res = await fetch(`/api/gyms/${slug}`);
        if (!res.ok) {
          setGym(null);
          return;
        }
        const data = await res.json();
        setGym(data.gym);
        // Set initial thumbnail when gym data is loaded
        if (data.gym) {
          const images = data.gym.images && data.gym.images.length > 0 
            ? data.gym.images 
            : (data.gym.mainImage || data.gym.thumbnail ? [data.gym.mainImage || data.gym.thumbnail] : []);
          const initialThumbnail = images[0] || '';
          setMainThumbnail(initialThumbnail);
          setActiveIndex(0);
        }
      } catch (error) {
        console.error('Error fetching gym:', error);
        setGym(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`/api/testimonials/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.testimonials || []);
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      }
    };

    if (slug) {
      fetchGym();
      fetchTestimonials();
    }
  }, [slug]);

  // Update mainThumbnail when gym data changes
  useEffect(() => {
    if (defaultMainImage && !mainThumbnail) {
      setMainThumbnail(defaultMainImage);
      setActiveIndex(0);
    }
  }, [defaultMainImage, mainThumbnail]);

  if (loading) {
    return (
      <main className="pb-0">
        <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[355px] top-0 z-0 bg-[#9FDDFF]"></div>
        <Header hamburgerColor="black" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <p className="text-lg sm:text-xl text-center">Loading...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!gym) {
    return (
      <main className="pb-0">
        <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[355px] top-0 z-0 bg-[#9FDDFF]"></div>
        <Header hamburgerColor="black" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <p className="text-lg sm:text-xl text-center">Gym not found</p>
        </div>
        <Footer />
      </main>
    );
  }

  // First image is default for main thumbnail, rest (max 4) for gallery
  const galleryThumbnails = allImages.slice(1, 5); // Get images from index 1-4 (max 4 thumbnails)

  const handleThumbnailClick = (src: string, galleryIndex: number) => {
    // galleryIndex is 0-based in galleryThumbnails array
    // Actual index in allImages is galleryIndex + 1
    setMainThumbnail(src);
    setActiveIndex(galleryIndex + 1);
  };

  return (
    <main className="pb-0">
      <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[355px] top-0 z-0 bg-[#9FDDFF]"></div>
      <Header hamburgerColor="black" />
      <div id="content" className="relative flex flex-col lg:flex-row w-full max-w-[1280px] gap-6 mx-auto px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 lg:mt-[96px] mb-8 md:mb-16">
        <section id="details" className="flex flex-col gap-6 w-full max-w-full lg:max-w-[820px] flex-1">
          <AnimateOnScroll animation="fadeInUp">
            <div id="main-thumbnail" className="w-full h-[250px] sm:h-[300px] md:h-[380px] lg:h-[453px] rounded-3xl bg-fitcamp-dark-blue overflow-hidden">
              <Image 
                src={mainThumbnail} 
                alt="main thumbnail" 
                width={820} 
                height={453}
                className="w-full h-full object-cover"
              />
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <div id="gallery" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {galleryThumbnails.map((thumb, galleryIndex) => {
              // Actual index in allImages is galleryIndex + 1 (since we skip index 0)
              const actualIndex = galleryIndex + 1;
              return (
                <button
                  key={actualIndex}
                  onClick={() => handleThumbnailClick(thumb, galleryIndex)}
                  className={`w-full rounded-2xl bg-[#D9D9D9] overflow-hidden transition-all duration-300 ${
                    activeIndex === actualIndex 
                      ? 'ring-[3px] ring-fitcamp-purple opacity-100' 
                      : 'opacity-50'
                  }`}
                >
                  <Image 
                    src={thumb} 
                    alt="thumbnail" 
                    width={200} 
                    height={120}
                    className="w-full h-full object-cover aspect-video"
                  />
                </button>
              );
            })}
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={150}>
            <div id="place-info" className="flex flex-col w-full rounded-3xl p-6 sm:p-8 gap-12 bg-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="font-['ClashDisplay-SemiBold'] text-2xl sm:text-3xl md:text-[32px] leading-[40px] tracking-[0.05em]">
                  {gym.name}
                </h1>
                <div className="flex items-center gap-2">
                  <Image 
                    src="/assets/images/icons/location-puple.svg" 
                    alt="icon" 
                    width={20} 
                    height={20}
                    className="flex shrink-0"
                  />
                  <p className="text-xl leading-6 tracking-[0.05em] opacity-50">{gym.location}</p>
                </div>
              </div>
              {gym.isPopular && (
                <p className="rounded-full py-3 px-6 bg-[#E56062] w-fit font-semibold leading-[19px] tracking-[0.05em] text-white">
                  Popular
                </p>
              )}
            </div>
            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <div className="flex flex-col gap-6">
                <h2 className="font-['ClashDisplay-SemiBold'] text-xl leading-6 tracking-[0.05em]">Facilities Available</h2>
                <hr className="opacity-10 border-black" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-6">
                {gym.facilities && gym.facilities.length > 0 ? (
                  gym.facilities.map((facility) => (
                    <div key={facility.id} className="flex items-center gap-2">
                      {facility.iconUrl ? (
                        <Image 
                          src={facility.iconUrl} 
                          alt={facility.name} 
                          width={56} 
                          height={56}
                          className="w-[56px] h-[56px] flex shrink-0"
                        />
                      ) : (
                        <div className="w-[56px] h-[56px] flex shrink-0 rounded-full bg-gray-200 items-center justify-center">
                          <span className="text-gray-500 text-xs">{facility.name.charAt(0)}</span>
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <p className="font-['ClashDisplay-SemiBold'] leading-[19px] tracking-[0.05em]">{facility.name}</p>
                        {facility.description && (
                          <p className="text-sm leading-[16px] tracking-[0.05em] opacity-50">{facility.description}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 col-span-full">No facilities available</p>
                )}
                </div>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={250}>
              <div className="flex flex-col gap-6">
                <h2 className="font-['ClashDisplay-SemiBold'] text-xl leading-6 tracking-[0.05em]">Description</h2>
                <hr className="opacity-10 border-black" />
                <p className="leading-[34px] tracking-[0.05em]">
                  Welcome to {gym.name}, your top choice for fitness in the city. Our gym features modern equipment, a variety of group classes, and comfortable amenities. Whether you're into cardio, strength training, or group workouts, we've got you covered. Enjoy our clean locker rooms, relaxing sauna, and easy access to all gym locations.
                </p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll animation="fadeInUp" delay={300}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3 shrink-0">
                  <Image 
                    src="/assets/images/icons/Daily Time.svg" 
                    alt="icon" 
                    width={80} 
                    height={80}
                    className="w-20 h-20 flex shrink-0"
                  />
                  <div className="flex flex-col gap-2">
                    <p className="font-['ClashDisplay-SemiBold'] text-xl leading-6 tracking-[0.05em]">Opening Work</p>
                    <p className="text-sm leading-[19px] tracking-[0.05em] opacity-50 text-nowrap">
                      {gym.openingHours || '08:00 AM - 09:00 PM'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <Image 
                    src="/assets/images/icons/Adress.svg" 
                    alt="icon" 
                    width={80} 
                    height={80}
                    className="w-20 h-20 flex shrink-0"
                  />
                  <div className="flex flex-col gap-3">
                    <p className="font-['ClashDisplay-SemiBold'] text-xl leading-6 tracking-[0.05em]">Detail Address</p>
                    <p className="leading-[22px] tracking-[0.05em] opacity-50">
                      {gym.address || 'Address not available'}
                    </p>
                  </div>
                </div>
              </div>
            </AnimateOnScroll>
            {testimonials.length > 0 && (
              <AnimateOnScroll animation="fadeInUp" delay={350}>
                <div id="reviews" className="flex flex-col w-full gap-6">
                <div className="flex flex-col gap-4">
                  <h2 className="font-['ClashDisplay-SemiBold'] text-2xl sm:text-3xl md:text-[32px] leading-[40px] tracking-[0.05em]">Happy Stories</h2>
                  <p className="leading-[19px] tracking-[0.03em] opacity-60">
                    What they said about this gym location, facilities, and environtment
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="font-['Poppins'] flex flex-col w-full rounded-3xl border border-[#E4E4E4] py-4 px-6 gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        {testimonial.imageUrl ? (
                          <div className="w-12 h-12 rounded-full border-[5px] border-white overflow-hidden relative shrink-0">
                            <Image
                              src={testimonial.imageUrl}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full border-[5px] border-white bg-gray-200 flex items-center justify-center shrink-0">
                            <span className="text-gray-500 text-sm font-semibold">{testimonial.name.charAt(0)}</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-sm leading-[22px] tracking-[0.03em]">{testimonial.name}</p>
                          <p className="text-xs leading-5 tracking-[0.03em] text-[#8D9397]">{testimonial.role}</p>
                        </div>
                      </div>
                      <p className="text-sm leading-[22px] tracking-[0.03em]">{testimonial.text}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Image
                            key={i}
                            src="/assets/images/icons/magic-star.svg"
                            alt="star"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </AnimateOnScroll>
            )}
            </div>
          </AnimateOnScroll>
        </section>
        <aside className="flex flex-col gap-6 w-full lg:w-auto lg:sticky lg:top-8 lg:self-start">
          <AnimateOnScroll animation="fadeInUp" delay={200}>
            <div className="flex flex-col w-full rounded-3xl p-6 sm:p-8 gap-6 bg-white">
            <p className="font-['ClashDisplay-SemiBold'] leading-[19px] tracking-[0.05em]">Access All Member Benefits</p>
            <div className="flex w-full h-[150px] sm:h-[200px] rounded-3xl overflow-hidden bg-fitcamp-royal-blue">
              <Image 
                src="/assets/images/thumbnails/Regular.png" 
                alt="plan" 
                width={400} 
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-4">
              <Image 
                src="/assets/images/icons/tick-circle.svg" 
                alt="icon" 
                width={32} 
                height={32}
                className="w-8 h-8 flex shrink-0"
              />
              <p className="leading-[19px] tracking-[0.05em]">Gym Facility Access</p>
            </div>
            <div className="flex items-center gap-4">
              <Image 
                src="/assets/images/icons/tick-circle.svg" 
                alt="icon" 
                width={32} 
                height={32}
                className="w-8 h-8 flex shrink-0"
              />
              <p className="leading-[19px] tracking-[0.05em]">All Class Enrollment</p>
            </div>
            <div className="flex items-center gap-4">
              <Image 
                src="/assets/images/icons/tick-circle.svg" 
                alt="icon" 
                width={32} 
                height={32}
                className="w-8 h-8 flex shrink-0"
              />
              <p className="leading-[19px] tracking-[0.05em]">Workshop & Discount</p>
            </div>
            <div className="flex items-center gap-4">
              <Image 
                src="/assets/images/icons/tick-circle.svg" 
                alt="icon" 
                width={32} 
                height={32}
                className="w-8 h-8 flex shrink-0"
              />
              <p className="leading-[19px] tracking-[0.05em]">Personal Training Sessions</p>
            </div>
            <Link 
              href="/subscription-list" 
              className="rounded-full py-3 px-6 bg-fitcamp-royal-blue font-semibold leading-[19px] tracking-[0.05em] text-white text-center hover:opacity-90 transition-opacity w-full"
            >
              Become Member
            </Link>
            </div>
          </AnimateOnScroll>
          {gym.contactPersonName && gym.contactPersonPhone && (
            <AnimateOnScroll animation="fadeInUp" delay={250}>
              <div className="flex flex-col w-full rounded-3xl p-6 sm:p-8 gap-4 bg-white">
              <p className="font-['ClashDisplay-SemiBold'] leading-[19px] tracking-[0.05em]">Contact Person</p>
              <hr className="border-black opacity-10" />
              <div className="flex items-center gap-3">
                <div className="flex w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <Image 
                    src="/assets/images/photos/Image-4.png" 
                    alt="contact person" 
                    width={40} 
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['ClashDisplay-SemiBold'] text-sm leading-[17px] tracking-[0.05em]">{gym.contactPersonName}</p>
                  <p className="text-xs leading-[14px] tracking-[0.05em] opacity-50">{gym.contactPersonPhone}</p>
                </div>
                </div>
              </div>
            </AnimateOnScroll>
          )}
        </aside>
      </div>
      <Footer />
      <ToTopButton />
    </main>
  );
}

