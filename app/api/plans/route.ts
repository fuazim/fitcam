import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
      },
      include: {
        features: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Transform to match frontend format
    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.priceCents / 100, // Convert cents to currency
      priceCents: plan.priceCents,
      currency: plan.currency,
      periodMonths: plan.periodMonths,
      imageUrl: plan.imageUrl,
      features: plan.features.map((feature) => ({
        id: feature.id,
        text: feature.text,
      })),
    }));

    return NextResponse.json({ plans: formattedPlans }, { status: 200 });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

