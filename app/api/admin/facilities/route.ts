import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const facilities = await prisma.facility.findMany({
      include: {
        _count: {
          select: {
            gyms: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ facilities }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching facilities:', error);
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, description, iconUrl } = body;

    const facility = await prisma.facility.create({
      data: {
        name,
        description,
        iconUrl,
      },
      include: {
        _count: {
          select: {
            gyms: true,
          },
        },
      },
    });

    return NextResponse.json({ facility }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating facility:', error);
    return NextResponse.json({ error: 'Failed to create facility' }, { status: 500 });
  }
}

