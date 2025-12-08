import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import AnimateOnScroll from '../components/AnimateOnScroll';
import ToTopButton from '../components/ToTopButton';

async function getPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      include: {
        features: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: 3, // Limit to 3 plans as default
    });

    // If plans found, return them
    if (plans.length > 0) {
      return plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        description: plan.description || 'Enjoy all subscribe package benefits',
        image: plan.imageUrl || '/assets/images/thumbnails/Regular-plan.png',
        price: `Rp ${(plan.priceCents / 100).toLocaleString('id-ID')}`,
        priceCents: plan.priceCents,
        period: `${plan.periodMonths} month${plan.periodMonths > 1 ? 's' : ''}`,
        periodMonths: plan.periodMonths,
        features: plan.features.map((f) => f.text),
      }));
    }

    // If no plans found, return default plans
    console.log('No active plans found in database, using default plans');
  } catch (error) {
    console.error('Error fetching plans:', error);
  }

  // Fallback to default plans if database error or no plans found
  return [
    {
      id: 'default-1',
      name: 'Regular Package Plan',
      description: 'Enjoy all subscribe package benefits',
      image: '/assets/images/thumbnails/Regular-plan.png',
      price: 'Rp 199.000',
      priceCents: 199000,
      period: '3 month',
      periodMonths: 3,
      features: [
        'Access to All Facilities',
        'Standard Class Enrollment',
        'Personal Training Session',
        'Exclusive Member Discounts',
      ],
    },
    {
      id: 'default-2',
      name: 'Super Package Plan',
      description: 'Enjoy all subscribe package benefits',
      image: '/assets/images/thumbnails/super-plan.png',
      price: 'Rp 299.000',
      priceCents: 29900000,
      period: '6 month',
      periodMonths: 6,
      features: [
        'Access to All Facilities',
        'Premium Class Enrollment',
        'Personal Training Session',
        'Exclusive Member Discounts',
        'Free Fitness Event Access',
      ],
    },
    {
      id: 'default-3',
      name: 'Mega Package Plan',
      description: 'Enjoy all subscribe package benefits',
      image: '/assets/images/thumbnails/mega-plan.png',
      price: 'Rp 399.000',
      priceCents: 39900000,
      period: '12 month',
      periodMonths: 12,
      features: [
        'Access to All Facilities',
        'Premium Class Enrollment',
        'Personal Training Session',
        'Exclusive Member Discounts',
        'Free Fitness Event Access',
        'Priority Booking',
      ],
    },
  ];
}

export default async function SubscriptionListPage() {
  const plans = await getPlans();

  return (
    <main className="pb-0">
      <Header hamburgerColor="black" />
      <div id="content" className="relative flex w-full max-w-[1312px] min-h-[600px] sm:min-h-[800px] md:min-h-[970px] h-fit mx-auto mt-12 md:mt-20 lg:mt-[120px] rounded-t-[32px] md:rounded-[32px] bg-fitcamp-royal-blue overflow-hidden">
        <Image 
          src="/assets/images/backgrounds/Illustration BG.svg" 
          alt="background" 
          fill
          className="absolute w-full h-full object-cover"
        />
        <div className="relative flex flex-col w-full items-center">
          <AnimateOnScroll animation="fadeInUp">
            <div className="flex flex-col gap-3 sm:gap-4 text-center mx-auto mt-8 sm:mt-10 md:mt-12 px-4 sm:px-6">
              <h2 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight md:leading-[59px] tracking-[0.05em]">
                Subscribe Package
              </h2>
              <p className="leading-[19px] tracking-[0.03em] opacity-60 text-sm sm:text-base">
                Find the perfect plan, explore our subscription packages. Discover the Best Package for You!
              </p>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={100}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-8 max-w-[1132px] w-full mx-auto mt-8 sm:mt-12 md:mt-16 lg:mt-20 mb-8 sm:mb-12 md:mb-16 lg:mb-[124px] px-4 sm:px-6 md:px-10">
              {plans.map((plan, index) => (
                <AnimateOnScroll key={plan.id} animation="scaleIn" delay={150 + (index * 100)}>
              <div key={plan.id} className="card flex flex-col w-full sm:w-[calc(50%-8px)] lg:w-[356px] rounded-3xl p-5 sm:p-6 md:p-8 lg:p-10 gap-4 sm:gap-6 bg-white">
                <div className="flex w-full h-[150px] sm:h-[180px] md:h-[200px] rounded-3xl overflow-hidden bg-fitcamp-royal-blue">
                  <Image 
                    src={plan.image} 
                    alt="icon" 
                    width={356} 
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p className="font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">{plan.name}</p>
                  <p className="text-xs sm:text-sm leading-[16px] tracking-[0.05em] opacity-50">{plan.description}</p>
                </div>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 sm:gap-4">
                    <Image 
                      src="/assets/images/icons/tick-circle.svg" 
                      alt="icon" 
                      width={32} 
                      height={32}
                      className="flex shrink-0 w-6 h-6 sm:w-8 sm:h-8"
                    />
                    <p className="leading-[19px] tracking-[0.05em] text-sm sm:text-base">{feature}</p>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mt-auto">
                  <Link 
                    href={`/checkout?planId=${plan.id}`}
                    className="w-full sm:w-fit rounded-full py-3 px-6 bg-fitcamp-royal-blue font-semibold leading-[19px] tracking-[0.05em] text-white text-center text-sm sm:text-base hover:opacity-90 transition-opacity"
                  >
                    Subscribe
                  </Link>
                  <p className="text-left sm:text-right font-semibold leading-[19px] tracking-[0.05em] text-sm sm:text-base">
                    {plan.price}
                    <span className="font-normal opacity-50">/<br />{plan.period}</span>
                  </p>
                </div>
              </div>
                </AnimateOnScroll>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
      <Footer />
      <ToTopButton />
    </main>
  );
}
