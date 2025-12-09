'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface PromoCode {
  id: string;
  code: string;
  description: string | null;
  discountPercent: number;
  discountCents: number;
  minPurchaseCents: number;
  maxDiscountCents: number | null;
  usageLimit: number | null;
  usedCount?: number;
  isActive: boolean;
  validFrom: Date | string | null;
  validUntil: Date | string | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export default function PromoCodeForm({
  promoCode,
  onSuccess,
}: {
  promoCode: PromoCode | null;
  onSuccess: (newPromoCode?: PromoCode) => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>(
    (promoCode?.discountPercent ?? 0) > 0 ? 'percent' : 'fixed'
  );

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      code: promoCode?.code || '',
      description: promoCode?.description || '',
      discountPercent: promoCode?.discountPercent || 0,
      discountCents: promoCode?.discountCents ? promoCode.discountCents / 100 : 0, // Convert cents to Rupiah for display
      minPurchaseCents: promoCode?.minPurchaseCents ? promoCode.minPurchaseCents / 100 : 0, // Convert cents to Rupiah for display
      maxDiscountCents: promoCode?.maxDiscountCents ? promoCode.maxDiscountCents / 100 : null, // Convert cents to Rupiah for display
      usageLimit: promoCode?.usageLimit || null,
      isActive: promoCode?.isActive !== undefined ? promoCode.isActive : true,
      validFrom: promoCode?.validFrom
        ? new Date(promoCode.validFrom).toISOString().split('T')[0]
        : '',
      validUntil: promoCode?.validUntil
        ? new Date(promoCode.validUntil).toISOString().split('T')[0]
        : '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        code: data.code.trim().toUpperCase(),
        description: data.description.trim() || null,
        discountPercent: discountType === 'percent' ? parseInt(data.discountPercent) || 0 : 0,
        discountCents: discountType === 'fixed' ? (parseInt(data.discountCents) || 0) * 100 : 0, // Convert Rupiah to cents
        minPurchaseCents: (parseInt(data.minPurchaseCents) || 0) * 100, // Convert Rupiah to cents
        maxDiscountCents: data.maxDiscountCents ? parseInt(data.maxDiscountCents) * 100 : null, // Convert Rupiah to cents
        usageLimit: data.usageLimit ? parseInt(data.usageLimit) : null,
        isActive: Boolean(data.isActive),
        validFrom: data.validFrom || null,
        validUntil: data.validUntil || null,
      };

      const url = promoCode ? `/api/admin/promo-codes/${promoCode.id}` : '/api/admin/promo-codes';
      const method = promoCode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save promo code');
      }

      const responseData = await res.json();
      toast.success(promoCode ? 'Promo code updated successfully' : 'Promo code created successfully');
      onSuccess(responseData.promoCode);
      if (!promoCode) {
        reset();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save promo code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Code *</Label>
        <Input
          id="code"
          {...register('code', { required: true })}
          placeholder="WELCOME10"
          className="uppercase"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          {...register('description')}
          placeholder="Welcome discount for new members"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Discount Type *</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="percent"
              checked={discountType === 'percent'}
              onChange={() => {
                setDiscountType('percent');
                setValue('discountCents', 0);
              }}
            />
            Percentage
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="fixed"
              checked={discountType === 'fixed'}
              onChange={() => {
                setDiscountType('fixed');
                setValue('discountPercent', 0);
              }}
            />
            Fixed Amount
          </label>
        </div>
      </div>

      {discountType === 'percent' ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor="discountPercent">Discount Percentage *</Label>
          <Input
            id="discountPercent"
            type="number"
            min="0"
            max="100"
            {...register('discountPercent', { required: true, min: 0, max: 100 })}
            placeholder="10"
          />
          <p className="text-xs text-gray-500">Enter percentage (0-100)</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Label htmlFor="discountCents">Discount Amount (in Rupiah) *</Label>
          <Input
            id="discountCents"
            type="number"
            min="0"
            {...register('discountCents', { required: true, min: 0 })}
            placeholder="50000"
          />
          <p className="text-xs text-gray-500">Enter amount in Rupiah (will be converted to cents)</p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="maxDiscountCents">Maximum Discount (in Rupiah)</Label>
        <Input
          id="maxDiscountCents"
          type="number"
          min="0"
          {...register('maxDiscountCents')}
          placeholder="100000"
        />
        <p className="text-xs text-gray-500">Optional: Maximum discount for percentage-based codes</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="minPurchaseCents">Minimum Purchase (in Rupiah)</Label>
        <Input
          id="minPurchaseCents"
          type="number"
          min="0"
          {...register('minPurchaseCents')}
          placeholder="100000"
        />
        <p className="text-xs text-gray-500">Minimum purchase amount required to use this code</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="usageLimit">Usage Limit</Label>
        <Input
          id="usageLimit"
          type="number"
          min="1"
          {...register('usageLimit')}
          placeholder="100"
        />
        <p className="text-xs text-gray-500">Optional: Maximum number of times this code can be used</p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="validFrom">Valid From</Label>
        <Input
          id="validFrom"
          type="date"
          {...register('validFrom')}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="validUntil">Valid Until</Label>
        <Input
          id="validUntil"
          type="date"
          {...register('validUntil')}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="w-4 h-4"
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Active
        </Label>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => onSuccess()}>
          Cancel
        </Button>
        <Button type="submit" className="bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white" disabled={loading}>
          {loading ? 'Saving...' : (promoCode ? 'Update Promo Code' : 'Create Promo Code')}
        </Button>
      </div>
    </form>
  );
}

