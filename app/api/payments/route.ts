import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, method, proofUrl } = body;

    if (!orderId || !method || !proofUrl) {
      return NextResponse.json(
        { error: 'Order ID, payment method, and proof URL are required' },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists
    const existingPayment = await prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment) {
      // Update existing payment
      const payment = await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          method: method as any,
          proofUrl,
          status: 'WAITING_PROOF',
        },
      });

      return NextResponse.json({ payment }, { status: 200 });
    }

    // Create new payment
    const payment = await prisma.payment.create({
      data: {
        orderId,
        method: method as any,
        amountCents: order.totalCents,
        proofUrl,
        status: 'WAITING_PROOF',
      },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment' },
      { status: 500 }
    );
  }
}

