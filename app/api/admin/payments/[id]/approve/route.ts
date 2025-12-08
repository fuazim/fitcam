import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    // Update payment status to SUCCESS
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'SUCCESS',
      },
      include: {
        order: true,
      },
    });

    // Update order status to PAID
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });

    // Create ticket
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: payment.order.planId },
    });

    if (plan) {
      const startsAt = new Date();
      const endsAt = new Date();
      endsAt.setMonth(endsAt.getMonth() + plan.periodMonths);

      await prisma.ticket.create({
        data: {
          orderId: payment.orderId,
          startsAt,
          endsAt,
          status: 'ACTIVE',
        },
      });
    }

    return NextResponse.json({ message: 'Payment approved successfully', payment }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error approving payment:', error);
    return NextResponse.json({ error: 'Failed to approve payment' }, { status: 500 });
  }
}

