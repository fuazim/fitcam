import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const citySlug = searchParams.get('city');
    const searchQuery = searchParams.get('q');

    // Build where clause
    const where: any = {};

    // Filter by city
    if (citySlug) {
      const city = await prisma.city.findUnique({
        where: { slug: citySlug },
      });
      if (city) {
        where.cityId = city.id;
      } else {
        return NextResponse.json({ gyms: [] }, { status: 200 });
      }
    }

    // Search query
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { locationText: { contains: searchQuery, mode: 'insensitive' } },
        { address: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }

    const gyms = await prisma.gym.findMany({
      where,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
          take: 1, // Just get first image for thumbnail
        },
      },
      orderBy: [
        { isPopular: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Transform to match frontend format
    const formattedGyms = gyms.map((gym) => ({
      id: gym.id,
      slug: gym.slug,
      name: gym.name,
      location: gym.locationText,
      thumbnail: gym.thumbnailUrl || gym.images[0]?.url || '',
      mainImage: gym.mainImageUrl || gym.images[0]?.url || '',
      address: gym.address,
      isPopular: gym.isPopular,
      city: gym.city,
      openingHours: gym.openingStartTime && gym.openingEndTime
        ? `${gym.openingStartTime} - ${gym.openingEndTime}`
        : null,
    }));

    return NextResponse.json({ gyms: formattedGyms }, { status: 200 });
  } catch (error) {
    console.error('Error fetching gyms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gyms' },
      { status: 500 }
    );
  }
}

