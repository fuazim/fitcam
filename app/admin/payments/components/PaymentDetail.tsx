'use client';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Payment {
  id: string;
  status: string;
  method: string;
  amountCents: number;
  proofUrl: string | null;
  createdAt: Date | string;
  order: {
    id: string;
    bookingCode: string;
    totalCents: number;
    currency?: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
    plan: {
      id: string;
      name: string;
    };
  };
}

export default function PaymentDetail({
  payment,
  onApprove,
  onReject,
  loading,
}: {
  payment: Payment;
  onApprove: () => void;
  onReject: () => void;
  loading: boolean;
}) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: (payment.order.currency || 'IDR') as string,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-2">Booking Code</p>
          <p className="font-mono font-semibold text-lg">{payment.order.bookingCode}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Status</p>
          <Badge className="bg-yellow-100 text-yellow-800">{payment.status}</Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4 text-lg">Payment Information</h3>
        <div className="space-y-3 text-base">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Method:</span>
            <span className="font-medium">{payment.method}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Amount:</span>
            <span className="font-semibold text-lg">{formatPrice(payment.amountCents)}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Order Total:</span>
            <span>{formatPrice(payment.order.totalCents)}</span>
          </div>
        </div>
      </div>

      {payment.proofUrl && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-4 text-lg">Payment Proof</h3>
            <div className="border border-gray-200 rounded-lg p-6">
              <Image
                src={payment.proofUrl}
                alt="Payment proof"
                width={600}
                height={400}
                className="w-full h-auto rounded-md"
              />
            </div>
            <a
              href={payment.proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fitcamp-royal-blue hover:underline text-sm mt-3 inline-block"
            >
              Open in new tab
            </a>
          </div>
        </>
      )}

      <Separator />

      <div>
        <h3 className="font-semibold mb-4 text-lg">Order Details</h3>
        <div className="space-y-2 text-base">
          <p>
            <span className="text-gray-500">Plan:</span>{' '}
            <span className="font-medium">{payment.order.plan.name}</span>
          </p>
          {payment.order.user && (
            <>
              <p>
                <span className="text-gray-500">Customer:</span>{' '}
                <span className="font-medium">{payment.order.user.name || 'N/A'}</span>
              </p>
              <p>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="font-medium">{payment.order.user.email}</span>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-6">
        <Button
          onClick={onApprove}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve Payment
        </Button>
        <Button
          onClick={onReject}
          disabled={loading}
          variant="destructive"
          className="flex-1"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <X className="mr-2 h-4 w-4" />
          )}
          Reject
        </Button>
      </div>

      <div className="text-xs text-gray-500 pt-2">
        Submitted: {new Date(payment.createdAt).toLocaleString()}
      </div>
    </div>
  );
}

