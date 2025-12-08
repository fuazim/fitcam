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

    const facility = await prisma.facility.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            gyms: true,
          },
        },
      },
    });

    if (!facility) {
      return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
    }

    return NextResponse.json({ facility }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching facility:', error);
    return NextResponse.json({ error: 'Failed to fetch facility' }, { status: 500 });
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
    const { name, description, iconUrl } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Facility name is required' }, { status: 400 });
    }

    const facility = await prisma.facility.update({
      where: { id },
      data: {
        name,
        description: description || null,
        iconUrl: iconUrl || null,
      },
      include: {
        _count: {
          select: {
            gyms: true,
          },
        },
      },
    });

    return NextResponse.json({ facility }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating facility:', error);

    let errorMessage = 'Failed to update facility';
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('name')) {
        errorMessage = 'Facility name already exists';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await prisma.facility.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Facility deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting facility:', error);
    return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 });
  }
}

