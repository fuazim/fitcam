'use client';

import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
}

export default function OrderDetail({ order }: { order: Order }) {
  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: (order.currency || 'IDR') as string,
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'SUCCESS':
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
      case 'WAITING_PROOF':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-gray-500 mb-2">Booking Code</p>
          <p className="font-mono font-semibold text-lg">{order.bookingCode}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Status</p>
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4 text-lg">Customer Information</h3>
        <div className="space-y-2 text-base">
          <p>
            <span className="text-gray-500">Name:</span>{' '}
            <span className="font-medium">{order.user?.name || 'Guest'}</span>
          </p>
          <p>
            <span className="text-gray-500">Email:</span>{' '}
            <span className="font-medium">{order.user?.email || 'N/A'}</span>
          </p>
          <p>
            <span className="text-gray-500">Phone:</span>{' '}
            <span className="font-medium">{order.user?.phone || 'N/A'}</span>
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4 text-lg">Order Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Plan:</span>
            <span className="font-medium">{order.plan.name}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Period:</span>
            <span>{order.plan.periodMonths} months</span>
          </div>
          {order.gym && (
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Gym:</span>
              <span>{order.gym.name}</span>
            </div>
          )}
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-500">Subtotal:</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-500">Discount:</span>
              <span className="text-red-600">-{formatPrice(order.discountCents)}</span>
            </div>
          )}
          <Separator className="my-3" />
          <div className="flex justify-between items-center font-semibold text-lg pt-1">
            <span>Total:</span>
            <span>{formatPrice(order.totalCents)}</span>
          </div>
        </div>
      </div>

      {order.payment && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-4 text-lg">Payment Information</h3>
            <div className="space-y-3 text-base">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Method:</span>
                <span className="font-medium">{order.payment.method}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(order.payment.status)}>
                  {order.payment.status}
                </Badge>
              </div>
              {order.payment.proofUrl && (
                <div className="pt-2">
                  <p className="text-gray-500 mb-2">Proof:</p>
                  <a
                    href={order.payment.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fitcamp-royal-blue hover:underline font-medium"
                  >
                    View Proof
                  </a>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {order.ticket && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-4 text-lg">Ticket Information</h3>
            <div className="space-y-3 text-base">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(order.ticket.status)}>
                  {order.ticket.status}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Starts:</span>
                <span>{new Date(order.ticket.startsAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-500">Ends:</span>
                <span>{new Date(order.ticket.endsAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="text-sm text-gray-500 pt-4">
        Created: {new Date(order.createdAt).toLocaleString()}
        {order.paidAt && ` | Paid: ${new Date(order.paidAt).toLocaleString()}`}
      </div>
    </div>
  );
}

