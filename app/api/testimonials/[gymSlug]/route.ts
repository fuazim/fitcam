import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gymSlug: string }> }
) {
  try {
    const { gymSlug } = await params;

    // Find gym by slug
    const gym = await prisma.gym.findUnique({
      where: { slug: gymSlug },
      select: { id: true },
    });

    if (!gym) {
      return NextResponse.json({ testimonials: [] }, { status: 200 });
    }

    // Get active testimonials for this gym
    const testimonials = await prisma.testimonial.findMany({
      where: {
        gymId: gym.id,
        isActive: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        name: true,
        role: true,
        text: true,
        imageUrl: true,
      },
    });

    return NextResponse.json({ testimonials }, { status: 200 });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

