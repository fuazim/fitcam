import AnimateOnScroll from './AnimateOnScroll';
import BenefitCardWrapper from './BenefitCardWrapper';

const benefits = [
  {
    icon: '/assets/images/icons/Flexible Time.svg',
    title: 'Flexible Time',
    description: 'Your schedule, your workout. flexibility that fits your life, no time limits',
  },
  {
    icon: '/assets/images/icons/Work From Anywhere.svg',
    title: 'Workout From Anywhere',
    description: 'Stay fit wherever you are. All locations, one membership, workout is just a click away',
  },
  {
    icon: '/assets/images/icons/Expert Trainer.svg',
    title: 'Expert Trainer',
    description: 'Unlock your potential with professional coaching, without any additional charge',
  },
  {
    icon: '/assets/images/icons/Schedule.svg',
    title: 'Well Planned Schedule',
    description: 'Optimize monthly membership scheduling for consistent progress and results',
  },
  {
    icon: '/assets/images/icons/Event.svg',
    title: 'Fitness Event',
    description: 'Enjoy fitness event benefit, joined membership get variety free class on every month',
  },
  {
    icon: '/assets/images/icons/Enjoy.svg',
    title: 'Enjoy All Facilitiese',
    description: 'Experience fitness at It\'s finest with our premium facilities. Train with the best',
  },
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="flex flex-col w-full max-w-[1280px] gap-6 md:gap-8 mx-auto px-4 sm:px-6 md:px-10 mt-12 md:mt-20 lg:mt-[120px]">
      <AnimateOnScroll animation="fadeInUp">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2 md:gap-4 text-center mx-auto">
            <h2 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight md:leading-[59px] tracking-[0.05em]">
              Unlock All the Membership Benefits
            </h2>
            <p className="leading-[19px] tracking-[0.03em] opacity-60 text-sm md:text-base">
              Experience full access to premium features, services, and facilities
            </p>
          </div>
        </div>
      </AnimateOnScroll>
      <AnimateOnScroll animation="fadeInUp" delay={100}>
        <div className="w-full max-w-[1060px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-20 mt-8 md:mt-12 lg:mt-20">
        {benefits.map((benefit, index) => (
          <BenefitCardWrapper
            key={index}
            icon={benefit.icon}
            title={benefit.title}
            description={benefit.description}
            index={index}
          />
        ))}
        </div>
      </AnimateOnScroll>
    </section>
  );
}

