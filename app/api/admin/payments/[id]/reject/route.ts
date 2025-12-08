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
    const body = await request.json();
    const { reason } = body;

    // Update payment status to FAILED
    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status: 'FAILED',
      },
    });

    return NextResponse.json({ message: 'Payment rejected', payment }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error rejecting payment:', error);
    return NextResponse.json({ error: 'Failed to reject payment' }, { status: 500 });
  }
}

