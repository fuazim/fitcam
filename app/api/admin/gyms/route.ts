import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const gyms = await prisma.gym.findMany({
      include: {
        city: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        facilities: {
          include: {
            facility: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ gyms }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching gyms:', error);
    return NextResponse.json({ error: 'Failed to fetch gyms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      name,
      slug,
      locationText,
      address,
      cityId,
      mainImageUrl,
      thumbnailUrl,
      isPopular,
      openingStartTime,
      openingEndTime,
      contactPersonName,
      contactPersonPhone,
      latitude,
      longitude,
      facilityIds,
      images,
    } = body;

    // Create gym
    const gym = await prisma.gym.create({
      data: {
        name,
        slug,
        locationText,
        address,
        cityId,
        mainImageUrl,
        thumbnailUrl,
        isPopular: isPopular || false,
        openingStartTime,
        openingEndTime,
        contactPersonName: contactPersonName || null,
        contactPersonPhone: contactPersonPhone || null,
        latitude,
        longitude,
        images: images
          ? {
              create: images.map((img: { url: string; sortOrder: number }, index: number) => ({
                url: img.url,
                sortOrder: img.sortOrder ?? index,
              })),
            }
          : undefined,
        facilities: facilityIds
          ? {
              create: facilityIds.map((facilityId: string) => ({
                facilityId,
              })),
            }
          : undefined,
      },
      include: {
        city: true,
        images: true,
        facilities: {
          include: {
            facility: true,
          },
        },
      },
    });

    return NextResponse.json({ gym }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error creating gym:', error);
    return NextResponse.json({ error: 'Failed to create gym' }, { status: 500 });
  }
}

