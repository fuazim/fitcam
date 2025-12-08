'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Eye, Check, X, AlertTriangle } from 'lucide-react';
import PaymentDetail from './PaymentDetail';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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

export default function PaymentsTable({ initialPayments }: { initialPayments: Payment[] }) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    paymentId: string | null;
  }>({
    open: false,
    type: null,
    paymentId: null,
  });

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const handleApprove = async (paymentId: string) => {
    setConfirmDialog({
      open: true,
      type: 'approve',
      paymentId,
    });
  };

  const handleReject = async (paymentId: string) => {
    setConfirmDialog({
      open: true,
      type: 'reject',
      paymentId,
    });
  };

  const confirmAction = async () => {
    if (!confirmDialog.paymentId || !confirmDialog.type) return;

    const paymentId = confirmDialog.paymentId;
    const type = confirmDialog.type;

    setLoading(paymentId);
    setConfirmDialog({ open: false, type: null, paymentId: null });

    try {
      if (type === 'approve') {
        const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
          method: 'POST',
        });

        if (!res.ok) throw new Error('Failed to approve payment');

        toast.success('Payment approved successfully');
        router.refresh();
        setPayments(payments.filter((p) => p.id !== paymentId));
      } else {
        const res = await fetch(`/api/admin/payments/${paymentId}/reject`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'Rejected by admin' }),
        });

        if (!res.ok) throw new Error('Failed to reject payment');

        toast.success('Payment rejected');
        router.refresh();
        setPayments(payments.filter((p) => p.id !== paymentId));
      }
    } catch (error) {
      toast.error(`Failed to ${type} payment`);
    } finally {
      setLoading(null);
    }
  };

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-200 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Pending Payments</h2>
        </div>
        <div className="overflow-x-auto px-4 sm:px-0">
          <Table>
            <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Booking Code</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Customer</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Plan</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Amount</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Method</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Status</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Date</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-right text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-12 sm:py-16 px-4 sm:px-6">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-lg font-medium">No pending payments</p>
                      <p className="text-sm text-gray-400">All payments have been reviewed</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-mono text-xs sm:text-sm text-gray-900">{payment.order.bookingCode}</TableCell>
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                      {payment.order.user ? (
                        <div>
                          <div className="font-medium text-gray-900 text-xs sm:text-sm">{payment.order.user.name || 'N/A'}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{payment.order.user.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs sm:text-sm">Guest</span>
                      )}
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{payment.order.plan.name}</TableCell>
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{formatPrice(payment.amountCents, (payment.order.currency || 'IDR') as string)}</TableCell>
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{payment.method}</TableCell>
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">{payment.status}</Badge>
                    </TableCell>
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleView(payment)}
                          className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-gray-100"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleApprove(payment.id)}
                          disabled={loading === payment.id}
                          className="h-8 w-8 sm:h-9 sm:w-9 text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleReject(payment.id)}
                          disabled={loading === payment.id}
                          className="h-8 w-8 sm:h-9 sm:w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="pb-4 sm:pb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold">Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <PaymentDetail
              payment={selectedPayment}
              onApprove={() => {
                setIsDialogOpen(false);
                handleApprove(selectedPayment.id);
              }}
              onReject={() => {
                setIsDialogOpen(false);
                handleReject(selectedPayment.id);
              }}
              loading={loading === selectedPayment.id}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => {
        if (!loading) {
          setConfirmDialog({ open, type: null, paymentId: null });
        }
      }}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader className="pb-6">
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 p-3 rounded-full ${confirmDialog.type === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
                <AlertTriangle className={`h-5 w-5 ${confirmDialog.type === 'approve' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {confirmDialog.type === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 leading-relaxed">
                  {confirmDialog.type === 'approve' 
                    ? 'Are you sure you want to approve this payment? This action cannot be undone.'
                    : 'Are you sure you want to reject this payment? This action cannot be undone.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, type: null, paymentId: null })}
              disabled={loading === confirmDialog.paymentId}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={loading === confirmDialog.paymentId}
              className={`flex-1 font-medium ${
                confirmDialog.type === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading === confirmDialog.paymentId ? (
                <>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  {confirmDialog.type === 'approve' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Approve
                    </>
                  ) : (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Reject
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

