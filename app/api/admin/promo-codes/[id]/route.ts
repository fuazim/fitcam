import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ promoCode }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching promo code:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
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

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase().trim() : undefined,
        description: description !== undefined ? description : undefined,
        discountPercent: discountPercent !== undefined ? discountPercent : undefined,
        discountCents: discountCents !== undefined ? discountCents : undefined,
        minPurchaseCents: minPurchaseCents !== undefined ? minPurchaseCents : undefined,
        maxDiscountCents: maxDiscountCents !== undefined ? maxDiscountCents : undefined,
        usageLimit: usageLimit !== undefined ? usageLimit : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        validFrom: validFrom !== undefined ? (validFrom ? new Date(validFrom) : null) : undefined,
        validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : undefined,
      },
    });

    return NextResponse.json({ promoCode }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Promo code deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}

