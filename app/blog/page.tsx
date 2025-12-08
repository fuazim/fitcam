import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import AnimateOnScroll from '../components/AnimateOnScroll';
import ToTopButton from '../components/ToTopButton';

export default function BlogPage() {
  return (
    <main className="pb-0">
      <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[355px] top-0 z-0 bg-[#9FDDFF]"></div>
      <Header hamburgerColor="black" menuTextColor="black" />
      <div className="relative flex flex-col items-center justify-center w-full max-w-[1280px] min-h-[60vh] mx-auto px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 lg:mt-[96px] mb-8 md:mb-16">
        <AnimateOnScroll animation="fadeInUp">
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl text-center bg-white rounded-3xl p-8 sm:p-12 md:p-16 shadow-sm">
          <div className="flex items-center justify-center w-full max-w-md mb-4">
            <Image
              src="/assets/images/thumbnails/mega-plan.png"
              alt="Blog illustration"
              width={400}
              height={300}
              className="w-full h-auto"
            />
          </div>
          <h1 className="font-['ClashDisplay-SemiBold'] text-3xl sm:text-4xl md:text-5xl leading-tight tracking-[0.05em] text-gray-900">
            Blog Under Development
          </h1>
          <p className="text-base sm:text-lg leading-relaxed tracking-[0.03em] text-gray-600 max-w-md">
            We're working hard to bring you amazing content. Our blog section will be available soon with fitness tips, workout guides, and health insights.
          </p>
          <div className="mt-4">
            <a
              href="/"
              className="inline-block rounded-full py-3 px-6 bg-fitcamp-royal-blue text-white font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
            >
              Back to Home
            </a>
          </div>
          </div>
        </AnimateOnScroll>
      </div>
      <Footer />
      <ToTopButton />
    </main>
  );
}

