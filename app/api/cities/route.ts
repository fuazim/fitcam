import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.city.findMany({
      where: {
        thumbnailUrl: {
          not: null,
        },
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            gyms: true,
          },
        },
      },
    });

    // Transform to match frontend format
    const formattedCities = cities.map((city) => ({
      id: city.id,
      name: city.name,
      slug: city.slug,
      thumbnailUrl: city.thumbnailUrl,
      gymCount: city._count.gyms,
    }));

    return NextResponse.json({ cities: formattedCities }, { status: 200 });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

