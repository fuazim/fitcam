import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

async function generateBookingCode(): Promise<string> {
  // Cari order terakhir dengan booking code yang match pattern FITCAMP-XXX
  const lastOrder = await prisma.order.findFirst({
    where: {
      bookingCode: {
        startsWith: 'FITCAMP-',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  let nextNumber = 1;
  
  if (lastOrder) {
    // Extract number from last booking code (e.g., "FITCAMP-001" -> 1)
    const match = lastOrder.bookingCode.match(/FITCAMP-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  // Format dengan padding 3 digit: FITCAMP-001, FITCAMP-002, dst
  let bookingCode = `FITCAMP-${String(nextNumber).padStart(3, '0')}`;
  
  // Pastikan booking code unique (handle race condition)
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.order.findUnique({
      where: { bookingCode },
    });
    
    if (!existing) {
      return bookingCode;
    }
    
    // Jika sudah ada, coba lagi dengan nomor berikutnya
    nextNumber++;
    bookingCode = `FITCAMP-${String(nextNumber).padStart(3, '0')}`;
    attempts++;
  }
  
  // Fallback: gunakan timestamp jika masih conflict
  return `FITCAMP-${Date.now().toString().slice(-6)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      phoneNumber,
      email,
      planId,
      gymId,
      paymentMethod,
      promoCode: promoCodeId,
    } = body;

    // Validate required fields
    if (!fullName || !phoneNumber || !email || !planId) {
      return NextResponse.json(
        { error: 'Full name, phone number, email, and plan ID are required' },
        { status: 400 }
      );
    }

    // Get plan details
    console.log('Creating order with planId:', planId);
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      console.error('Plan not found in database. planId:', planId);
      // List available plans for debugging
      const availablePlans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      });
      console.error('Available plans:', availablePlans);
      
      return NextResponse.json(
        { 
          error: 'Plan not found',
          message: `Plan with ID "${planId}" was not found in the database.`,
          availablePlans: availablePlans.map(p => ({ id: p.id, name: p.name })),
        },
        { status: 404 }
      );
    }
    
    console.log('Plan found:', { id: plan.id, name: plan.name, priceCents: plan.priceCents });

    // Generate booking code
    const bookingCode = await generateBookingCode();

    // Check if user exists, if not create one
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: fullName,
          email,
          phone: phoneNumber || null,
          role: 'USER',
        },
      });
    } else {
      // Update user info if needed
      await prisma.user.update({
        where: { id: user.id },
        data: {
          name: fullName || user.name,
          phone: phoneNumber || user.phone,
        },
      });
    }

    // Calculate totals
    const subtotalCents = plan.priceCents;
    let discountCents = 0;
    let promoCodeRecord = null;

    // Validate and apply promo code if provided
    if (promoCodeId) {
      promoCodeRecord = await prisma.promoCode.findUnique({
        where: { code: promoCodeId.toUpperCase().trim() },
      });

      if (promoCodeRecord && promoCodeRecord.isActive) {
        // Check validity dates
        const now = new Date();
        const isValidDate = 
          (!promoCodeRecord.validFrom || now >= promoCodeRecord.validFrom) &&
          (!promoCodeRecord.validUntil || now <= promoCodeRecord.validUntil);

        // Check usage limit
        const isWithinLimit = 
          !promoCodeRecord.usageLimit || promoCodeRecord.usedCount < promoCodeRecord.usageLimit;

        // Check minimum purchase
        const meetsMinPurchase = 
          promoCodeRecord.minPurchaseCents === 0 || subtotalCents >= promoCodeRecord.minPurchaseCents;

        if (isValidDate && isWithinLimit && meetsMinPurchase) {
          // Calculate discount
          if (promoCodeRecord.discountPercent > 0) {
            discountCents = Math.round((subtotalCents * promoCodeRecord.discountPercent) / 100);
            if (promoCodeRecord.maxDiscountCents && discountCents > promoCodeRecord.maxDiscountCents) {
              discountCents = promoCodeRecord.maxDiscountCents;
            }
          } else if (promoCodeRecord.discountCents > 0) {
            discountCents = promoCodeRecord.discountCents;
            if (discountCents > subtotalCents) {
              discountCents = subtotalCents;
            }
          }
        } else {
          // Promo code validation failed, don't apply it
          console.warn('Promo code validation failed:', {
            isValidDate,
            isWithinLimit,
            meetsMinPurchase,
            promoCode: promoCodeRecord.code,
          });
          promoCodeRecord = null; // Don't apply invalid promo code
        }
      } else {
        // Promo code not found or inactive
        console.warn('Promo code not found or inactive:', promoCodeId);
        promoCodeRecord = null;
      }
    }

    const totalCents = subtotalCents - discountCents;

    // Create order
    const order = await prisma.order.create({
      data: {
        bookingCode,
        userId: user.id,
        planId: plan.id,
        gymId: gymId || null,
        promoCodeId: promoCodeRecord?.id || null,
        status: 'PENDING',
        subtotalCents,
        discountCents,
        totalCents,
        paymentMethod: paymentMethod || 'MANUAL',
      },
      include: {
        plan: true,
        gym: {
          select: {
            id: true,
            name: true,
            locationText: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        promoCode: promoCodeRecord ? {
          select: {
            id: true,
            code: true,
            description: true,
          },
        } : false,
      },
    });

    // Update promo code usage count if used
    if (promoCodeRecord && discountCents > 0) {
      await prisma.promoCode.update({
        where: { id: promoCodeRecord.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
      console.log('Promo code usage count updated:', promoCodeRecord.code);
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}

