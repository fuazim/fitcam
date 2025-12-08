import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingCode, phoneNumber } = body;

    if (!bookingCode || !phoneNumber) {
      return NextResponse.json(
        { error: 'Booking code and phone number are required' },
        { status: 400 }
      );
    }

    // Find order by booking code
    const order = await prisma.order.findUnique({
      where: { bookingCode: bookingCode.trim().toUpperCase() },
      include: {
        plan: {
          include: {
            features: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },
        },
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
            phone: true,
          },
        },
        payment: true,
        ticket: true,
        promoCode: {
          select: {
            id: true,
            code: true,
            description: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify phone number matches
    if (!order.user || order.user.phone !== phoneNumber.trim()) {
      return NextResponse.json(
        { error: 'Invalid booking code or phone number' },
        { status: 401 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error('Error looking up order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to lookup order' },
      { status: 500 }
    );
  }
}

