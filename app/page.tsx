import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import LocationSection from './components/LocationSection';
import LatestSection from './components/LatestSection';
import TestimonialSection from './components/TestimonialSection';
import BenefitsSection from './components/BenefitsSection';
import Footer from './components/Footer';
import ToTopButton from './components/ToTopButton';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <LocationSection />
      <LatestSection />
      <TestimonialSection />
      <BenefitsSection />
      <Footer />
      <ToTopButton />
    </main>
  );
}
