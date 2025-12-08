import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const gym = await prisma.gym.findUnique({
      where: { slug },
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
        },
        facilities: {
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                description: true,
                iconUrl: true,
              },
            },
          },
        },
      },
    });

    if (!gym) {
      return NextResponse.json(
        { error: 'Gym not found' },
        { status: 404 }
      );
    }

    // Transform to match frontend format
    const formattedGym = {
      id: gym.id,
      slug: gym.slug,
      name: gym.name,
      location: gym.locationText,
      thumbnail: gym.thumbnailUrl || gym.images[0]?.url || '',
      mainImage: gym.mainImageUrl || gym.images[0]?.url || '',
      images: gym.images.map((img) => img.url),
      address: gym.address,
      isPopular: gym.isPopular,
      city: gym.city,
      openingHours: gym.openingStartTime && gym.openingEndTime
        ? `${gym.openingStartTime} - ${gym.openingEndTime}`
        : null,
      facilities: gym.facilities.map((gf) => ({
        id: gf.facility.id,
        name: gf.facility.name,
        description: gf.facility.description,
        iconUrl: gf.facility.iconUrl,
      })),
      latitude: gym.latitude,
      longitude: gym.longitude,
      contactPersonName: gym.contactPersonName,
      contactPersonPhone: gym.contactPersonPhone,
    };

    return NextResponse.json({ gym: formattedGym }, { status: 200 });
  } catch (error) {
    console.error('Error fetching gym:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gym' },
      { status: 500 }
    );
  }
}

