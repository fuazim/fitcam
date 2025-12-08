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
import { Input } from '@/components/ui/input';
import { Eye, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import OrderDetail from './OrderDetail';
import { toast } from 'sonner';

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

export default function OrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders based on search query
  const filteredOrders = orders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.bookingCode.toLowerCase().includes(query) ||
      order.user?.name?.toLowerCase().includes(query) ||
      order.user?.email?.toLowerCase().includes(query) ||
      order.plan.name.toLowerCase().includes(query)
    );
  });

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const exportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredOrders.map((order) => ({
        'Booking Code': order.bookingCode,
        'Customer Name': order.user?.name || 'Guest',
        'Email': order.user?.email || 'N/A',
        'Phone': order.user?.phone || 'N/A',
        'Plan': order.plan.name,
        'Gym': order.gym?.name || 'N/A',
        'Subtotal': order.subtotalCents / 100,
        'Discount': order.discountCents / 100,
        'Total': order.totalCents / 100,
        'Status': order.status,
        'Payment Method': order.paymentMethod,
        'Payment Status': order.payment?.status || 'N/A',
        'Created At': new Date(order.createdAt).toLocaleString('id-ID'),
        'Paid At': order.paidAt ? new Date(order.paidAt).toLocaleString('id-ID') : 'N/A',
      }));

      // Convert to CSV format
      const headers = Object.keys(excelData[0] || {});
      const csvContent = [
        headers.join(','),
        ...excelData.map((row) =>
          headers.map((header) => {
            const value = row[header as keyof typeof row];
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        ),
      ].join('\n');

      // Create blob and download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `orders-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Orders exported successfully');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-200 bg-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">All Orders</h2>
        </div>
        {/* Search and Export Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <Input
              type="text"
              placeholder="Search by booking code, customer, email, or plan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-full"
            />
          </div>
          <div className="w-full sm:w-auto">
            <Button
              onClick={exportToExcel}
              className="h-11 w-full sm:w-auto bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white px-6"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to Excel
            </Button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto px-4 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Booking Code</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Customer</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Plan</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Total</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Status</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Date</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-right text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-12 sm:py-16 px-4 sm:px-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-lg font-medium">
                      {orders.length === 0 
                        ? 'No orders found' 
                        : 'No orders match your search'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {orders.length === 0 
                        ? 'Orders will appear here once customers make purchases' 
                        : 'Try adjusting your search query'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-mono text-xs sm:text-sm text-gray-900">{order.bookingCode}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                    {order.user ? (
                      <div>
                        <div className="font-medium text-gray-900 text-xs sm:text-sm">{order.user.name || 'N/A'}</div>
                        <div className="text-xs sm:text-sm text-gray-500">{order.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs sm:text-sm">Guest</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{order.plan.name}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{formatPrice(order.totalCents, order.currency || 'IDR')}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                    <Badge className={`${getStatusColor(order.status)} text-xs`}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-gray-100">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader className="pb-4 sm:pb-6">
                          <DialogTitle className="text-xl sm:text-2xl font-bold">Order Details</DialogTitle>
                        </DialogHeader>
                        <OrderDetail order={order} />
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

