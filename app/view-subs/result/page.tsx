'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Image from 'next/image';
import { toast } from 'sonner';
import AnimateOnScroll from '../../components/AnimateOnScroll';
import ToTopButton from '../../components/ToTopButton';

interface Order {
  id: string;
  bookingCode: string;
  status: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency?: string;
  paymentMethod: string;
  createdAt: Date | string;
  paidAt: Date | string | null;
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
    priceCents?: number;
    imageUrl?: string | null;
  };
  gym: {
    id: string;
    name: string;
    locationText: string;
  } | null;
  payment: {
    id: string;
    status: string;
    method: string;
    proofUrl: string | null;
  } | null;
  ticket: {
    id: string;
    status: string;
    startsAt: Date | string;
    endsAt: Date | string;
  } | null;
  promoCode: {
    id: string;
    code: string;
    description: string | null;
  } | null;
}

function ViewSubsResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        toast.error('No order ID provided');
        router.push('/view-subs');
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
        const data = await response.json();
        setOrder(data.order);
      } catch (error: any) {
        console.error('Error fetching order:', error);
        toast.error(error.message || 'Failed to load order details');
        router.push('/view-subs');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: (order?.currency || 'IDR') as string,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'SUCCESS':
      case 'ACTIVE':
        return 'bg-green-500';
      case 'PENDING':
      case 'WAITING_PROOF':
        return 'bg-[#E56062]';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-gray-500';
      default:
        return 'bg-[#E56062]';
    }
  };

  // Calculate start and end dates
  const getStartDate = () => {
    if (order?.ticket?.startsAt) {
      return new Date(order.ticket.startsAt);
    }
    return new Date(order?.createdAt || Date.now());
  };

  const getEndDate = () => {
    if (order?.ticket?.endsAt) {
      return new Date(order.ticket.endsAt);
    }
    if (order?.createdAt && order?.plan?.periodMonths) {
      const startDate = new Date(order.createdAt);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + order.plan.periodMonths);
      return endDate;
    }
    return new Date();
  };

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-lg sm:text-xl text-center">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <p className="text-lg sm:text-xl text-center">Order not found</p>
      </div>
    );
  }

  const startDate = getStartDate();
  const endDate = getEndDate();
  const planImage = order?.plan?.imageUrl || '/assets/images/thumbnails/Regular-plan.png';
  const paymentStatus = order?.payment?.status || order?.status || 'PENDING';

  return (
    <>
      <div className="relative flex flex-col lg:flex-row justify-center w-full max-w-[1280px] gap-4 sm:gap-6 mx-auto px-4 sm:px-6 md:px-10 mt-8 sm:mt-12 md:mt-16 lg:mt-[96px] mb-8 md:mb-16">
        {/* Left Card: Transaction Ticket */}
        <AnimateOnScroll animation="fadeInUp">
          <div className="flex flex-col w-full lg:max-w-[665px] shrink-0 rounded-3xl px-4 sm:px-6 md:px-8 lg:px-[57.5px] py-6 sm:py-8 md:py-10 lg:py-[46px] gap-4 sm:gap-6 bg-white">
            <Image 
              src="/assets/images/icons/ticket-lifting.svg" 
              alt="ticket illustration" 
              width={350} 
              height={350}
              className="w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] h-auto mx-auto"
            />
            <h1 className="font-['ClashDisplay-SemiBold'] text-xl sm:text-2xl md:text-3xl lg:text-[32px] leading-tight sm:leading-8 md:leading-10 tracking-[0.05em] text-center">
              Transaction Ticket
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="font-['ClashDisplay-SemiBold'] text-sm sm:text-base leading-[19px] tracking-[0.05em]">Booking ID</p>
              <p className="text-sm sm:text-base leading-[19px] tracking-[0.05em] break-all sm:break-normal">{order.bookingCode}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="font-['ClashDisplay-SemiBold'] text-sm sm:text-base leading-[19px] tracking-[0.05em]">Started At</p>
              <p className="text-sm sm:text-base leading-[19px] tracking-[0.05em]">{formatDate(startDate)}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="font-['ClashDisplay-SemiBold'] text-sm sm:text-base leading-[19px] tracking-[0.05em]">Ended At</p>
              <p className="text-sm sm:text-base leading-[19px] tracking-[0.05em]">{formatDate(endDate)}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="font-['ClashDisplay-SemiBold'] text-sm sm:text-base leading-[19px] tracking-[0.05em]">Total Payment</p>
              <p className="text-sm sm:text-base leading-[19px] tracking-[0.05em] font-bold">{formatPrice(order.totalCents)}</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <p className="font-['ClashDisplay-SemiBold'] text-sm sm:text-base leading-[19px] tracking-[0.05em]">Payment Status</p>
              <p className={`rounded-full py-2 sm:py-3 px-4 sm:px-6 w-fit text-xs sm:text-sm font-semibold leading-[19px] tracking-[0.05em] text-white ${getStatusColor(paymentStatus)}`}>
                {formatStatus(paymentStatus)}
              </p>
            </div>
          </div>
        </AnimateOnScroll>

        {/* Right Card: Plan Details */}
        <AnimateOnScroll animation="fadeInUp" delay={150}>
          <div className="flex flex-col w-full lg:max-w-[356px] h-fit rounded-3xl p-4 sm:p-6 md:p-8 gap-4 sm:gap-6 bg-white">
            <div className="flex w-full h-[150px] sm:h-[180px] md:h-[200px] rounded-3xl overflow-hidden bg-fitcamp-royal-blue">
              <Image 
                src={planImage} 
                alt="plan illustration" 
                width={356} 
                height={200}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-['ClashDisplay-SemiBold'] text-sm sm:text-base leading-[19px] tracking-[0.05em]">
                {order.plan.name}
              </p>
              <p className="text-xs sm:text-sm leading-[16px] tracking-[0.05em] opacity-50">
                {order.plan.description || 'Starter membership, start your journey'}
              </p>
            </div>
            <p className="text-sm sm:text-base font-semibold leading-[19px] tracking-[0.05em]">
              {formatPrice(order.subtotalCents)}
              <span className="font-normal opacity-50">/{order.plan.periodMonths} month{order.plan.periodMonths > 1 ? 's' : ''}</span>
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </>
  );
}

export default function ViewSubsResultPage() {
  return (
    <main className="pb-0">
      <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[345px] top-0 z-0 bg-[#9FDDFF]"></div>
      <Header hamburgerColor="black" />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen px-4">
          <p className="text-lg sm:text-xl text-center">Loading order details...</p>
        </div>
      }>
        <ViewSubsResultContent />
      </Suspense>
      <Footer />
      <ToTopButton />
    </main>
  );
}

