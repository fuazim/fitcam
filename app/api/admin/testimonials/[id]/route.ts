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

    const testimonialData = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!testimonialData) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 });
    }

    // Manually fetch gym data
    let gym = null;
    if (testimonialData.gymId) {
      gym = await prisma.gym.findUnique({
        where: { id: testimonialData.gymId },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    }

    const testimonial = { ...testimonialData, gym };

    return NextResponse.json({ testimonial }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching testimonial:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonial' }, { status: 500 });
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
    const { name, role, text, imageUrl, gymId, isActive, sortOrder } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!role || role.trim() === '') {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }
    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Testimonial text is required' }, { status: 400 });
    }

    const testimonialData = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        role,
        text,
        imageUrl: imageUrl || null,
        gymId: gymId || null,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      },
    });

    // Manually fetch gym data
    let gym = null;
    if (testimonialData.gymId) {
      gym = await prisma.gym.findUnique({
        where: { id: testimonialData.gymId },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
    }

    const testimonial = { ...testimonialData, gym };

    return NextResponse.json({ testimonial }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update testimonial' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await prisma.testimonial.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Testimonial deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
  }
}

