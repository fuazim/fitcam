import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ promoCodes }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      code,
      description,
      discountPercent,
      discountCents,
      minPurchaseCents,
      maxDiscountCents,
      usageLimit,
      isActive,
      validFrom,
      validUntil,
    } = body;

    if (!code || code.trim() === '') {
      return NextResponse.json(
        { error: 'Promo code is required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        description: description || null,
        discountPercent: discountPercent || 0,
        discountCents: discountCents || 0,
        minPurchaseCents: minPurchaseCents || 0,
        maxDiscountCents: maxDiscountCents || null,
        usageLimit: usageLimit || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json({ promoCode }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create promo code' },
      { status: 500 }
    );
  }
}

