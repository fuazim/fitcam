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
    const gym = await prisma.gym.findUnique({
      where: { id },
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
    });

    if (!gym) {
      return NextResponse.json({ error: 'Gym not found' }, { status: 404 });
    }

    return NextResponse.json({ gym }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching gym:', error);
    return NextResponse.json({ error: 'Failed to fetch gym' }, { status: 500 });
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

    // Update gym
    const gym = await prisma.gym.update({
      where: { id },
      data: {
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
        contactPersonName: contactPersonName || null,
        contactPersonPhone: contactPersonPhone || null,
        latitude,
        longitude,
        // Update facilities
        facilities: {
          deleteMany: {},
          create: facilityIds?.map((facilityId: string) => ({
            facilityId,
          })) || [],
        },
        // Update images
        images: images
          ? {
              deleteMany: {},
              create: images.map((img: { url: string; sortOrder: number }, index: number) => ({
                url: img.url,
                sortOrder: img.sortOrder ?? index,
              })),
            }
          : undefined,
      },
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
    });

    return NextResponse.json({ gym }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error updating gym:', error);
    return NextResponse.json({ error: 'Failed to update gym' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await prisma.gym.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Gym deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error deleting gym:', error);
    return NextResponse.json({ error: 'Failed to delete gym' }, { status: 500 });
  }
}

