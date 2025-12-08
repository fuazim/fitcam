'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function ViewSubsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    bookingId: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bookingId || !formData.phoneNumber) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/orders/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingCode: formData.bookingId,
          phoneNumber: formData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show toast error for invalid booking code or phone number
        const errorMessage = data.error || 'Failed to find order';
        toast.error(errorMessage, {
          duration: 4000,
        });
        return;
      }

      if (data.order) {
        // Redirect to order details page or show order info
        router.push(`/view-subs/result?orderId=${data.order.id}`);
      }
    } catch (error: any) {
      console.error('Error looking up order:', error);
      toast.error('Invalid booking code or phone number. Please check your input and try again.', {
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <main className="pb-0">
      <div id="background" className="absolute w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[345px] top-0 z-0 bg-[#9FDDFF]"></div>
      <Header hamburgerColor="black" />
      <div className="relative w-full px-4 sm:px-6 md:px-0">
        <form onSubmit={handleSubmit} className="relative flex flex-col items-center w-full max-w-[642px] text-center rounded-3xl p-6 sm:p-8 py-8 sm:py-12 md:py-16 lg:py-[70px] gap-6 sm:gap-8 bg-white mx-auto mt-8 sm:mt-12 md:mt-16 lg:mt-[120px] mb-8 md:mb-16">
          <Image 
            src="/assets/images/icons/Booking ID.svg" 
            alt="icon" 
            width={400} 
            height={400}
            className="flex shrink-0 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-[400px] lg:h-[400px]"
          />
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <h1 className="font-['ClashDisplay-Semibold'] text-2xl sm:text-3xl md:text-[32px] leading-tight sm:leading-8 md:leading-10 tracking-[0.05em]">View Subscription</h1>
          </div>
          <label className="flex flex-col gap-1 font-['Poppins'] w-full items-start">
            <p className="font-semibold text-fitcamp-black text-sm sm:text-base">Booking ID</p>
            <input
              type="text"
              name="bookingId"
              value={formData.bookingId}
              onChange={handleChange}
              className="outline-none flex w-full rounded-xl px-3 py-3 sm:py-4 border border-[#BFBFBF] bg-white font-['Poppins'] text-sm leading-[22px] tracking-[0.03em] placeholder:text-[#BFBFBF] transition-all duration-300 focus:border-black"
              placeholder="Input your Booking ID from transaction"
              required
            />
          </label>
          <label className="flex flex-col gap-1 font-['Poppins'] w-full items-start">
            <p className="font-semibold text-fitcamp-black text-sm sm:text-base">Phone Number</p>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="outline-none flex w-full rounded-xl px-3 py-3 sm:py-4 border border-[#BFBFBF] bg-white font-['Poppins'] text-sm leading-[22px] tracking-[0.03em] placeholder:text-[#BFBFBF] transition-all duration-300 focus:border-black"
              placeholder="Input your phone number based on transaction"
              required
            />
          </label>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-fit rounded-full py-3 px-6 bg-fitcamp-royal-blue font-semibold leading-[19px] tracking-[0.05em] text-white text-center text-sm sm:text-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'View My Subscription'}
          </button>
        </form>
      </div>
      <Footer />
      <Toaster position="top-center" richColors />
    </main>
  );
}

