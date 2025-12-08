import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import AnimateOnScroll from '../components/AnimateOnScroll';
import ToTopButton from '../components/ToTopButton';

export default function AboutPage() {
  return (
    <main className="pb-0">
      <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[355px] top-0 z-0 bg-[#9FDDFF]"></div>
      <Header hamburgerColor="black" menuTextColor="black" />
      <div className="relative flex flex-col w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 lg:mt-[96px] mb-8 md:mb-16">
        <div className="flex flex-col gap-8 sm:gap-12 bg-white rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm">
          <AnimateOnScroll animation="fadeInUp">
            <div className="flex flex-col gap-6 text-center">
              <div className="flex items-center justify-center w-full max-w-md mx-auto">
                <Image
                  src="/assets/images/thumbnails/banner.png"
                  alt="Fitcamp About"
                  width={600}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                />
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="font-['ClashDisplay-SemiBold'] text-3xl sm:text-4xl md:text-5xl leading-tight tracking-[0.05em] text-gray-900">
                  About Fitcamp
                </h1>
                <div className="w-24 h-1 bg-fitcamp-royal-blue mx-auto rounded-full"></div>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="flex flex-col gap-6 sm:gap-8">
            <AnimateOnScroll animation="fadeInUp" delay={100}>
              <section className="flex flex-col gap-4">
              <h2 className="font-['ClashDisplay-SemiBold'] text-xl sm:text-2xl leading-tight tracking-[0.05em] text-gray-900">
                Our Mission
              </h2>
              <p className="text-base sm:text-lg leading-relaxed tracking-[0.03em] text-gray-700">
                Fitcamp is dedicated to making fitness accessible to everyone. We believe that a healthy lifestyle should be convenient, affordable, and enjoyable.                 Our mission is to connect fitness enthusiasts with the best gym facilities across Indonesia, providing flexible subscription plans that fit your lifestyle.
              </p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={150}>
              <section className="flex flex-col gap-4">
                <h2 className="font-['ClashDisplay-SemiBold'] text-xl sm:text-2xl leading-tight tracking-[0.05em] text-gray-900">
                  What We Offer
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50">
                  <h3 className="font-semibold text-lg tracking-[0.05em] text-gray-900">Multiple Locations</h3>
                  <p className="text-sm sm:text-base leading-relaxed tracking-[0.03em] text-gray-600">
                    Access to gyms across multiple cities in Indonesia
                  </p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50">
                  <h3 className="font-semibold text-lg tracking-[0.05em] text-gray-900">Flexible Plans</h3>
                  <p className="text-sm sm:text-base leading-relaxed tracking-[0.03em] text-gray-600">
                    Choose from various subscription plans that suit your needs
                  </p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50">
                  <h3 className="font-semibold text-lg tracking-[0.05em] text-gray-900">Premium Facilities</h3>
                  <p className="text-sm sm:text-base leading-relaxed tracking-[0.03em] text-gray-600">
                    State-of-the-art equipment and modern amenities
                  </p>
                </div>
                <div className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50">
                  <h3 className="font-semibold text-lg tracking-[0.05em] text-gray-900">Expert Support</h3>
                  <p className="text-sm sm:text-base leading-relaxed tracking-[0.03em] text-gray-600">
                    Professional trainers and friendly staff to guide you
                  </p>
                </div>
                </div>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={200}>
              <section className="flex flex-col gap-4">
                <h2 className="font-['ClashDisplay-SemiBold'] text-xl sm:text-2xl leading-tight tracking-[0.05em] text-gray-900">
                  Why Choose Fitcamp?
                </h2>
              <p className="text-base sm:text-lg leading-relaxed tracking-[0.03em] text-gray-700">
                We understand that fitness is a personal journey. That's why we've created a platform that gives you the freedom to work out at any of our partner gyms, whenever it's convenient for you. Whether you're a beginner or a fitness enthusiast, Fitcamp provides the flexibility and support you need to achieve your health and wellness goals.
              </p>
              </section>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInUp" delay={250}>
              <section className="flex flex-col gap-4 pt-4 border-t border-gray-200">
              <h2 className="font-['ClashDisplay-SemiBold'] text-xl sm:text-2xl leading-tight tracking-[0.05em] text-gray-900">
                Get Started Today
              </h2>
              <p className="text-base sm:text-lg leading-relaxed tracking-[0.03em] text-gray-700 mb-4">
                Ready to start your fitness journey? Explore our subscription plans and find the perfect fit for your lifestyle.
              </p>
              <a
                href="/subscription-list"
                className="inline-block w-fit rounded-full py-3 px-6 bg-fitcamp-royal-blue text-white font-semibold text-sm sm:text-base hover:opacity-90 transition-opacity"
              >
                View Subscription Plans
              </a>
              </section>
            </AnimateOnScroll>
          </div>
        </div>
      </div>
      <Footer />
      <ToTopButton />
    </main>
  );
}

