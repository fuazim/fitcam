'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import PromoCodeForm from './PromoCodeForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountPercent: number;
  discountCents: number;
  minPurchaseCents: number;
  maxDiscountCents: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: Date | string | null;
  validUntil: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export default function PromoCodesTable({ initialPromoCodes }: { initialPromoCodes: PromoCode[] }) {
  const router = useRouter();
  const [promoCodes, setPromoCodes] = useState(initialPromoCodes);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState<PromoCode | null>(null);

  // Filter promo codes based on search query (starts with)
  const filteredPromoCodes = promoCodes.filter((promoCode) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return promoCode.code.toLowerCase().startsWith(query);
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete promo code');

      toast.success('Promo code deleted successfully');
      const fetchRes = await fetch('/api/admin/promo-codes');
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setPromoCodes(data.promoCodes);
      } else {
        setPromoCodes(promoCodes.filter((p) => p.id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete promo code');
    }
  };

  const handleEdit = (promoCode: PromoCode) => {
    setEditingPromoCode(promoCode);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPromoCode(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = async (newPromoCode?: PromoCode) => {
    setIsDialogOpen(false);
    const wasEditing = editingPromoCode;
    setEditingPromoCode(null);

    try {
      const res = await fetch('/api/admin/promo-codes');
      if (res.ok) {
        const data = await res.json();
        setPromoCodes(data.promoCodes);
      } else {
        if (newPromoCode) {
          if (wasEditing) {
            setPromoCodes(promoCodes.map((p) => (p.id === wasEditing.id ? newPromoCode : p)));
          } else {
            setPromoCodes([...promoCodes, newPromoCode]);
          }
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      if (newPromoCode) {
        if (wasEditing) {
          setPromoCodes(promoCodes.map((p) => (p.id === wasEditing.id ? newPromoCode : p)));
        } else {
          setPromoCodes([...promoCodes, newPromoCode]);
        }
      } else {
        router.refresh();
      }
    }
  };

  const formatPrice = (cents: number) => {
    return `Rp ${(cents / 100).toLocaleString('id-ID')}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-200 bg-white">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">All Promo Codes</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleCreate} 
                className="w-full bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Promo Code
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader className="pb-4 sm:pb-6">
                <DialogTitle className="text-xl sm:text-2xl font-bold">
                  {editingPromoCode ? 'Edit Promo Code' : 'Create New Promo Code'}
                </DialogTitle>
              </DialogHeader>
              <PromoCodeForm promoCode={editingPromoCode} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        {/* Search Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
            <Input
              type="text"
              placeholder="Search promo codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 w-full"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto px-4 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Code</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Description</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Discount</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Min Purchase</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Usage</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Status</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Valid Period</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-right text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPromoCodes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-12 sm:py-16 px-4 sm:px-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-lg font-medium">No promo codes found</p>
                    <p className="text-sm text-gray-400">Create your first promo code to get started!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPromoCodes.map((promoCode) => (
                <TableRow key={promoCode.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">{promoCode.code}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{promoCode.description || '-'}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-xs sm:text-sm">
                    {promoCode.discountPercent > 0 ? (
                      <span className="text-gray-900">{promoCode.discountPercent}%</span>
                    ) : (
                      <span className="text-gray-900">{formatPrice(promoCode.discountCents)}</span>
                    )}
                    {promoCode.maxDiscountCents && (
                      <span className="text-xs text-gray-500 block mt-1">
                        Max: {formatPrice(promoCode.maxDiscountCents)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">
                    {promoCode.minPurchaseCents > 0 ? formatPrice(promoCode.minPurchaseCents) : 'No minimum'}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">
                    {promoCode.usageLimit ? (
                      <span>
                        {promoCode.usedCount} / {promoCode.usageLimit}
                      </span>
                    ) : (
                      <span>{promoCode.usedCount} (unlimited)</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                    <Badge className={`${promoCode.isActive ? 'bg-green-500' : 'bg-gray-400'} text-xs`}>
                      {promoCode.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-xs sm:text-sm text-gray-600">
                    {promoCode.validFrom || promoCode.validUntil ? (
                      <div>
                        <div>From: {formatDate(promoCode.validFrom)}</div>
                        <div>Until: {formatDate(promoCode.validUntil)}</div>
                      </div>
                    ) : (
                      'No limit'
                    )}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(promoCode)}
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-gray-100"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(promoCode.id)}
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
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
  );
}

