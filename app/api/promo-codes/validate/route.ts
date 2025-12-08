import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, subtotalCents } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found', valid: false },
        { status: 404 }
      );
    }

    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: 'Promo code is not active', valid: false },
        { status: 400 }
      );
    }

    // Check validity dates
    const now = new Date();
    if (promoCode.validFrom && now < promoCode.validFrom) {
      return NextResponse.json(
        { error: 'Promo code is not yet valid', valid: false },
        { status: 400 }
      );
    }

    if (promoCode.validUntil && now > promoCode.validUntil) {
      return NextResponse.json(
        { error: 'Promo code has expired', valid: false },
        { status: 400 }
      );
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return NextResponse.json(
        { error: 'Promo code has reached usage limit', valid: false },
        { status: 400 }
      );
    }

    // Check minimum purchase
    if (subtotalCents && promoCode.minPurchaseCents > 0 && subtotalCents < promoCode.minPurchaseCents) {
      return NextResponse.json(
        { 
          error: `Minimum purchase of Rp ${(promoCode.minPurchaseCents / 100).toLocaleString('id-ID')} required`,
          valid: false 
        },
        { status: 400 }
      );
    }

    // Calculate discount
    let discountCents = 0;
    if (promoCode.discountPercent > 0 && subtotalCents) {
      discountCents = Math.floor((subtotalCents * promoCode.discountPercent) / 100);
      if (promoCode.maxDiscountCents && discountCents > promoCode.maxDiscountCents) {
        discountCents = promoCode.maxDiscountCents;
      }
    } else if (promoCode.discountCents > 0) {
      discountCents = promoCode.discountCents;
      if (subtotalCents && discountCents > subtotalCents) {
        discountCents = subtotalCents;
      }
    }

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        description: promoCode.description,
        discountCents,
        discountPercent: promoCode.discountPercent,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}

