'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { toast } from 'sonner';

interface Order {
  id: string;
  bookingCode: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  user: {
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
  } | null;
  plan: {
    id: string;
    name: string;
    periodMonths: number;
    description: string | null;
  };
  promoCode: {
    id: string;
    code: string;
    description: string | null;
  } | null;
  payment: {
    id: string;
    status: string;
    method: string;
    proofUrl: string | null;
  } | null;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'MANDIRI'>('BCA');

  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID found');
      router.push('/subscription-list');
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (error: any) {
        console.error('Error fetching order:', error);
        toast.error(error.message || 'Failed to load order details');
        router.push('/subscription-list');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !selectedFile) {
      toast.error('Please upload transfer proof');
      return;
    }

    setSubmitting(true);
    try {
      // Upload proof to Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);

      const uploadRes = await fetch('/api/payments/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        const error = await uploadRes.json();
        throw new Error(error.error || 'Failed to upload proof');
      }

      const uploadData = await uploadRes.json();

      // Create payment record (map BCA/MANDIRI to MANUAL)
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          method: 'MANUAL', // BCA and MANDIRI both use MANUAL method
          proofUrl: uploadData.url,
        }),
      });

      if (!paymentRes.ok) {
        const error = await paymentRes.json();
        throw new Error(error.error || 'Failed to submit payment');
      }

      toast.success('Payment proof submitted successfully!');
      router.push(`/booking-complete?orderId=${order.id}&bookingCode=${order.bookingCode}`);
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (cents: number) => {
    return `Rp ${(cents / 100).toLocaleString('id-ID')}`;
  };

  if (loading) {
    return (
      <main className="pb-0">
        <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[345px] top-0 z-0 bg-[#9FDDFF]"></div>
        <Header hamburgerColor="black" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <p className="text-lg sm:text-xl text-center">Loading order details...</p>
        </div>
        <Footer />
      </main>
    );
  }

  if (!order) {
    return (
      <main className="pb-0">
        <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[345px] top-0 z-0 bg-[#9FDDFF]"></div>
        <Header hamburgerColor="black" />
        <div className="flex items-center justify-center min-h-screen px-4">
          <p className="text-lg sm:text-xl text-center">Order not found</p>
        </div>
        <Footer />
      </main>
    );
  }

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
                Confirm and make sure your contact before checkout
              </p>
            </div>
            <hr className="border-black opacity-10" />
            <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">
                Full Name
              </p>
              <p className="leading-[19px] tracking-[0.05em] text-sm sm:text-base">{order.user?.name || 'N/A'}</p>
            </div>
            <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">
                Phone Number
              </p>
              <p className="leading-[19px] tracking-[0.05em] text-sm sm:text-base">{order.user?.phone || 'N/A'}</p>
            </div>
            <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">Email</p>
              <p className="leading-[19px] tracking-[0.05em] text-sm sm:text-base break-all">{order.user?.email || 'N/A'}</p>
            </div>
          </div>
          <div id="booking-items" className="flex flex-col w-full rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex flex-col gap-2">
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-6 tracking-[0.05em]">
                Booking ID : <span className="text-fitcamp-royal-blue">{order.bookingCode}</span>
              </p>
            </div>
            <div className="items flex flex-nowrap gap-3 sm:gap-4 w-full">
              <Image src="/assets/images/icons/cart.svg" alt="icon" width={40} height={40} className="flex shrink-0 w-8 h-8 sm:w-10 sm:h-10" />
              <div className="flex flex-col gap-2 w-full min-w-0">
                <div className="flex justify-between">
                  <p className="font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">{order.plan.name}</p>
                </div>
                <p className="text-xs sm:text-sm leading-[16px] tracking-[0.03em] opacity-60">
                  {order.plan.periodMonths} Month{order.plan.periodMonths > 1 ? 's' : ''} - {order.plan.description || 'All Benefits Included'}
                </p>
              </div>
            </div>
            <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">Subtotal</p>
              <p className="leading-[19px] tracking-[0.05em] text-sm sm:text-base">{formatPrice(order.subtotalCents)}</p>
            </div>
            <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">Promo Code</p>
              <p className="leading-[19px] tracking-[0.05em] text-sm sm:text-base text-[#EC0307]">-{formatPrice(order.discountCents)}</p>
            </div>
            <hr className="border-black border-dashed" />
            <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <p className="flex w-full sm:w-[162px] shrink-0 font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-sm sm:text-base">PPN (10%)</p>
              <p className="leading-[19px] tracking-[0.05em] text-sm sm:text-base">
                {formatPrice(Math.floor((order.totalCents * 10) / 100))}
              </p>
            </div>
            <div className="w-full flex justify-between items-center rounded-2xl py-3 sm:py-4 px-4 sm:px-6 md:px-8 bg-[#D0EEFF]">
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-[34px] tracking-[0.05em]">Total Payment</p>
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-[34px] tracking-[0.05em] text-right">
                {formatPrice(order.totalCents + Math.floor((order.totalCents * 10) / 100))}
              </p>
            </div>
          </div>
          <div id="transfer-proof" className="flex flex-col w-full rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex flex-col gap-2">
              <p className="font-['ClashDisplay-Semibold'] leading-[19px] tracking-[0.05em] text-fitcamp-black text-sm sm:text-base">
                Transfer Proof
              </p>
              <p className="text-xs sm:text-sm leading-[16px] tracking-[0.03em] opacity-60">
                Upload your transfer proof to complete the payment process
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-[#BFBFBF] p-6 sm:p-8 text-center hover:border-fitcamp-royal-blue transition-colors"
              >
                {selectedFile ? (
                  <p className="text-xs sm:text-sm text-fitcamp-royal-blue break-all">{selectedFile.name}</p>
                ) : (
                  <p className="text-xs sm:text-sm text-[#BFBFBF]">Click to upload transfer proof</p>
                )}
              </button>
            </div>
          </div>
        </div>
        <aside id="sidebar" className="flex flex-col gap-4 sm:gap-6 w-full lg:w-[400px] lg:sticky lg:top-8 lg:self-start">
          <div className="flex flex-col rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="font-['ClashDisplay-Semibold'] text-lg sm:text-xl leading-6 tracking-[0.05em]">Transfer to</p>
              <p className="text-xs sm:text-sm leading-[16px] tracking-[0.03em] opacity-60">
                Select one of the two banks below
              </p>
              <div className="flex flex-col gap-3 sm:gap-4">
                <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 ${selectedBank === 'BCA' ? 'border-fitcamp-royal-blue' : 'border-[#BFBFBF]'} bg-white cursor-pointer`}>
                  <input
                    type="radio"
                    name="bank"
                    value="BCA"
                    checked={selectedBank === 'BCA'}
                    onChange={() => setSelectedBank('BCA')}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <Image src="/assets/images/logos/BCA.svg" alt="BCA" width={80} height={40} className="w-16 h-8 sm:w-20 sm:h-10" />
                  <div className="flex flex-col flex-1">
                    <p className="text-xs sm:text-sm font-semibold">Fitnesia Corporation</p>
                    <p className="text-xs sm:text-sm opacity-60">129405960495</p>
                  </div>
                </label>
                <label className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 ${selectedBank === 'MANDIRI' ? 'border-fitcamp-royal-blue' : 'border-[#BFBFBF]'} bg-white cursor-pointer`}>
                  <input
                    type="radio"
                    name="bank"
                    value="MANDIRI"
                    checked={selectedBank === 'MANDIRI'}
                    onChange={() => setSelectedBank('MANDIRI')}
                    className="w-4 h-4 sm:w-5 sm:h-5"
                  />
                  <Image src="/assets/images/logos/MANDIRI.svg" alt="Mandiri" width={80} height={40} className="w-16 h-8 sm:w-20 sm:h-10" />
                  <div className="flex flex-col flex-1">
                    <p className="text-xs sm:text-sm font-semibold">Fitnesia Corporation</p>
                    <p className="text-xs sm:text-sm opacity-60">129405960495</p>
                  </div>
                </label>
              </div>
            </div>
            <button
              type="submit"
              className="rounded-full py-3 px-6 bg-fitcamp-royal-blue font-semibold leading-[19px] tracking-[0.05em] text-white text-center text-sm sm:text-base hover:opacity-90 transition-opacity w-full disabled:opacity-50"
              disabled={submitting || !selectedFile}
            >
              {submitting ? 'Submitting...' : 'Confirm'}
            </button>
          </div>
        </aside>
      </form>
      <Footer />
    </main>
  );
}
