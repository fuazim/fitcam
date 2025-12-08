import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            description: true,
            periodMonths: true,
            priceCents: true,
            imageUrl: true,
            features: {
              orderBy: {
                sortOrder: 'asc',
              },
              select: {
                id: true,
                text: true,
                sortOrder: true,
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
        promoCode: {
          select: {
            id: true,
            code: true,
            description: true,
          },
        },
        payment: true,
        ticket: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

