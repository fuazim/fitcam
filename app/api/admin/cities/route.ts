import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            gyms: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ cities }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, thumbnailUrl } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'City name is required' }, { status: 400 });
    }
    if (!thumbnailUrl || thumbnailUrl.trim() === '') {
      return NextResponse.json({ error: 'City thumbnail is required' }, { status: 400 });
    }

    // Generate slug from name
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists, if so, append number
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.city.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const city = await prisma.city.create({
      data: {
        name,
        slug,
        thumbnailUrl,
      },
      include: {
        _count: {
          select: {
            gyms: true,
          },
        },
      },
    });

    return NextResponse.json({ city }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating city:', error);
    
    // Return more detailed error message
    let errorMessage = 'Failed to create city';
    if (error.code === 'P2002') {
      // Unique constraint violation
      if (error.meta?.target?.includes('name')) {
        errorMessage = 'City name already exists';
      } else if (error.meta?.target?.includes('slug')) {
        errorMessage = 'City slug already exists';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

