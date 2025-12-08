'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  periodMonths: number;
  imageUrl: string | null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('planId');
  const gymId = searchParams.get('gymId');
  
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('bca');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeValid, setPromoCodeValid] = useState<{ valid: boolean; discountCents: number; code: string } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Fetch plan details
  useEffect(() => {
    console.log('Checkout page - planId:', planId);
    if (!planId) {
      console.log('No planId found, redirecting to subscription-list');
      toast.error('No plan selected');
      router.push('/subscription-list');
      return;
    }

    setLoadingPlan(true);

    // Handle default plans (not in database)
    if (planId.startsWith('default-')) {
      const defaultPlans: Record<string, Plan> = {
        'default-1': {
          id: 'default-1',
          name: 'Regular Package Plan',
          description: 'Enjoy all subscribe package benefits',
          priceCents: 199000,
          periodMonths: 3,
          imageUrl: '/assets/images/thumbnails/Regular-plan.png',
        },
        'default-2': {
          id: 'default-2',
          name: 'Super Package Plan',
          description: 'Enjoy all subscribe package benefits',
          priceCents: 299000,
          periodMonths: 6,
          imageUrl: '/assets/images/thumbnails/super-plan.png',
        },
        'default-3': {
          id: 'default-3',
          name: 'Mega Package Plan',
          description: 'Enjoy all subscribe package benefits',
          priceCents: 399000,
          periodMonths: 12,
          imageUrl: '/assets/images/thumbnails/mega-plan.png',
        },
      };

      const defaultPlan = defaultPlans[planId];
      if (defaultPlan) {
        setPlan(defaultPlan);
        setLoadingPlan(false);
      } else {
        toast.error('Plan not found');
        router.push('/subscription-list');
        setLoadingPlan(false);
      }
      return;
    }

    // Fetch from API for real plans
    fetch(`/api/plans`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch plans');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Fetched plans from API:', data);
        const selectedPlan = data.plans?.find((p: Plan) => p.id === planId);
        console.log('Looking for planId:', planId);
        console.log('Available plans:', data.plans?.map((p: Plan) => ({ id: p.id, name: p.name })));
        
        if (selectedPlan) {
          console.log('Plan found:', selectedPlan);
          setPlan({
            id: selectedPlan.id,
            name: selectedPlan.name,
            description: selectedPlan.description,
            priceCents: selectedPlan.priceCents,
            periodMonths: selectedPlan.periodMonths,
            imageUrl: selectedPlan.imageUrl,
          });
        } else {
          console.error('Plan not found in API response. planId:', planId);
          toast.error(`Plan not found. Please try again from subscription list.`);
          router.push('/subscription-list');
        }
        setLoadingPlan(false);
      })
      .catch((error) => {
        console.error('Error fetching plan:', error);
        toast.error('Failed to load plan details');
        router.push('/subscription-list');
        setLoadingPlan(false);
      });
  }, [planId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted', { plan, formData, paymentMethod });
    
    if (!plan) {
      toast.error('Please wait for plan to load');
      return;
    }

    // Validate form data
    if (!formData.fullName || !formData.phoneNumber || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Creating order with:', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        planId: plan.id,
        gymId: gymId || null,
        paymentMethod: 'MANUAL',
      });

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          planId: plan.id,
          gymId: gymId || null,
          paymentMethod: 'MANUAL',
          promoCode: promoCodeValid?.valid ? promoCodeValid.code : null,
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error('Order creation failed:', errorData);
        throw new Error(errorData.error || errorData.message || 'Failed to create order');
      }

      const data = await response.json();
      console.log('Order created successfully:', data);
      
      if (!data.order || !data.order.id) {
        throw new Error('Invalid order response from server');
      }
      
      toast.success('Order created successfully!');
      
      // Redirect to payment page with order ID
      const paymentUrl = `/payment?orderId=${data.order.id}`;
      console.log('Redirecting to:', paymentUrl);
      router.push(paymentUrl);
    } catch (error: any) {
      console.error('Error creating order:', error);
      const errorMessage = error.message || 'Failed to create order';
      console.error('Error details:', {
        message: errorMessage,
        plan: plan?.id,
        formData,
      });
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleValidatePromoCode = async () => {
    if (!promoCode || !plan) return;

    setValidatingPromo(true);
    try {
      const res = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode,
          subtotalCents: plan.priceCents,
        }),
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setPromoCodeValid({
          valid: true,
          discountCents: data.promoCode.discountCents,
          code: data.promoCode.code,
        });
      } else {
        setPromoCodeValid({
          valid: false,
          discountCents: 0,
          code: promoCode,
        });
        toast.error(data.error || 'Invalid promo code');
      }
    } catch (error: any) {
      console.error('Error validating promo code:', error);
      toast.error('Failed to validate promo code');
      setPromoCodeValid({
        valid: false,
        discountCents: 0,
        code: promoCode,
      });
    } finally {
      setValidatingPromo(false);
    }
  };

  return (
    <main className="pb-0">
      <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[345px] top-0 z-0 bg-[#9FDDFF]"></div>
      <Header hamburgerColor="black" />
      <form onSubmit={handleSubmit} id="content" className="relative flex flex-col lg:flex-row w-full max-w-[1280px] gap-4 sm:gap-6 mx-auto px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 lg:mt-[96px] mb-8 md:mb-16">
        <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-full lg:max-w-[820px] shrink-0">
          <div id="account" className="flex flex-col w-full rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex flex-col gap-2">
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-6 tracking-[0.05em]">Account Details</p>
              <p className="text-xs sm:text-sm leading-[16px] tracking-[0.03em] opacity-60">
                Fill your data and make sure your contact before checkout
              </p>
            </div>
            <hr className="border-black opacity-10" />
            <label className="group flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">
                Full Name
              </p>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="outline-none flex w-full rounded-xl px-3 py-3 sm:py-4 border border-[#BFBFBF] bg-white font-['Poppins'] text-sm leading-[22px] tracking-[0.03em] placeholder:text-[#BFBFBF] transition-all duration-300 group-focus-within:border-black"
                placeholder="Input full name of yourself"
                required
              />
            </label>
            <label className="group flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">
                Phone Number
              </p>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="outline-none flex w-full rounded-xl px-3 py-3 sm:py-4 border border-[#BFBFBF] bg-white font-['Poppins'] text-sm leading-[22px] tracking-[0.03em] placeholder:text-[#BFBFBF] transition-all duration-300 group-focus-within:border-black"
                placeholder="Input valid phone number for validation"
                required
              />
            </label>
            <label className="group flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">Email</p>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="outline-none flex w-full rounded-xl px-3 py-3 sm:py-4 border border-[#BFBFBF] bg-white font-['Poppins'] text-sm leading-[22px] tracking-[0.03em] placeholder:text-[#BFBFBF] transition-all duration-300 group-focus-within:border-black"
                placeholder="Input your valid email address"
                required
              />
            </label>
          </div>
          <div id="promo-code" className="flex flex-col w-full rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex flex-col gap-2">
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-6 tracking-[0.05em]">Promo Code</p>
              <p className="text-xs sm:text-sm leading-[16px] tracking-[0.03em] opacity-60">
                Enter your promo code to get discount
              </p>
            </div>
            <hr className="border-black opacity-10" />
            <div className="flex gap-3">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="outline-none flex-1 rounded-xl px-3 py-3 sm:py-4 border border-[#BFBFBF] bg-white font-['Poppins'] text-sm leading-[22px] tracking-[0.03em] placeholder:text-[#BFBFBF] transition-all duration-300 focus:border-black"
              />
              <button
                type="button"
                onClick={handleValidatePromoCode}
                disabled={validatingPromo || !promoCode}
                className="rounded-xl px-6 py-3 sm:py-4 bg-fitcamp-royal-blue font-semibold leading-[19px] tracking-[0.05em] text-white text-sm sm:text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validatingPromo ? 'Validating...' : 'Apply'}
              </button>
            </div>
            {promoCodeValid && (
              <div className={`p-3 rounded-xl ${promoCodeValid.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="text-sm">
                  {promoCodeValid.valid 
                    ? `Promo code applied! Discount: Rp ${(promoCodeValid.discountCents / 100).toLocaleString('id-ID')}`
                    : 'Invalid promo code'
                  }
                </p>
              </div>
            )}
          </div>
          <div id="booking-items" className="flex flex-col w-full rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex flex-col gap-2">
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-6 tracking-[0.05em]">Booking Details</p>
              <p className="text-xs sm:text-sm leading-[16px] tracking-[0.03em] opacity-60">
                Your next workout awaits, check booking details here
              </p>
            </div>
            <hr className="border-black opacity-10" />
            {plan ? (
              <>
                <div className="items flex flex-nowrap gap-3 sm:gap-4 w-full">
                  <Image src="/assets/images/icons/cart.svg" alt="icon" width={40} height={40} className="flex shrink-0 w-8 h-8 sm:w-10 sm:h-10" />
                  <div className="flex flex-col gap-2 w-full min-w-0">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
                      <p className="font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">{plan.name}</p>
                      <div className="flex gap-3 sm:gap-4 items-center">
                        <p className="font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">
                          Rp {(plan.priceCents / 100).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm leading-[16px] tracking-[0.03em] opacity-60">
                      {plan.periodMonths} Month{plan.periodMonths > 1 ? 's' : ''} - {plan.description || 'All Benefits Included'}
                    </p>
                  </div>
                </div>
                <hr className="border-black opacity-10" />
                <div className="w-full flex justify-between items-center rounded-2xl py-3 sm:py-4 px-4 sm:px-6 md:px-8 bg-[#D0EEFF]">
                  <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-[34px] tracking-[0.05em]">Total</p>
                  <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-[34px] tracking-[0.05em] text-right">
                    {promoCodeValid?.valid && promoCodeValid.discountCents > 0 ? (
                      <>
                        <span className="line-through opacity-50 text-sm mr-2">
                          Rp{(plan.priceCents / 100).toLocaleString('id-ID')}
                        </span>
                        Rp{((plan.priceCents - promoCodeValid.discountCents) / 100).toLocaleString('id-ID')}
                      </>
                    ) : (
                      `Rp${(plan.priceCents / 100).toLocaleString('id-ID')}`
                    )}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-gray-500">Loading plan details...</p>
              </div>
            )}
          </div>
        </div>
        <aside id="sidebar" className="flex flex-col gap-4 sm:gap-6 w-full lg:w-[400px] lg:sticky lg:top-8 lg:self-start">
          <div className="flex flex-col rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-6 tracking-[0.05em]">Payment Method</p>
              <div className="flex flex-col gap-3 sm:gap-4">
                <label 
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 bg-white cursor-pointer transition-all ${
                    paymentMethod === 'bca' ? 'border-fitcamp-royal-blue' : 'border-[#BFBFBF]'
                  }`}
                  onClick={() => setPaymentMethod('bca')}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="bca" 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    checked={paymentMethod === 'bca'}
                    onChange={() => setPaymentMethod('bca')}
                  />
                  <Image src="/assets/images/logos/BCA.svg" alt="BCA" width={80} height={40} className="w-16 h-8 sm:w-20 sm:h-10" />
                </label>
                <label 
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 bg-white cursor-pointer transition-all ${
                    paymentMethod === 'mandiri' ? 'border-fitcamp-royal-blue' : 'border-[#BFBFBF]'
                  }`}
                  onClick={() => setPaymentMethod('mandiri')}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="mandiri" 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                    checked={paymentMethod === 'mandiri'}
                    onChange={() => setPaymentMethod('mandiri')}
                  />
                  <Image src="/assets/images/logos/MANDIRI.svg" alt="Mandiri" width={80} height={40} className="w-16 h-8 sm:w-20 sm:h-10" />
                </label>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || !plan || loadingPlan}
              className="rounded-full py-3 px-6 bg-fitcamp-royal-blue font-semibold leading-[19px] tracking-[0.05em] text-white text-center text-sm sm:text-base hover:opacity-90 transition-opacity w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Processing...' : 'Continue to Payment'}
            </button>
          </div>
        </aside>
      </form>
      <Footer />
    </main>
  );
}

