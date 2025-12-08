import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const testimonialsData = await prisma.testimonial.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Manually fetch gym data for each testimonial
    const testimonials = await Promise.all(
      testimonialsData.map(async (testimonial) => {
        if (testimonial.gymId) {
          const gym = await prisma.gym.findUnique({
            where: { id: testimonial.gymId },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          });
          return { ...testimonial, gym };
        }
        return { ...testimonial, gym: null };
      })
    );

    return NextResponse.json({ testimonials }, { status: 200 });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (authError: any) {
    console.error('Auth error:', authError);
    return NextResponse.json({ 
      error: 'Unauthorized',
      message: 'Unauthorized access',
    }, { status: 401 });
  }

  try {
    let body;
    try {
      body = await request.json();
      console.log('Received body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body',
        message: 'Invalid request body format',
      }, { status: 400 });
    }
    
    const { name, role, text, imageUrl, gymId, isActive, sortOrder } = body;

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json({ 
        error: 'Name is required',
        message: 'Name is required',
      }, { status: 400 });
    }
    if (!role || role.trim() === '') {
      return NextResponse.json({ 
        error: 'Role is required',
        message: 'Role is required',
      }, { status: 400 });
    }
    if (!text || text.trim() === '') {
      return NextResponse.json({ 
        error: 'Testimonial text is required',
        message: 'Testimonial text is required',
      }, { status: 400 });
    }

    console.log('Creating testimonial with data:', {
      name: name.trim(),
      role: role.trim(),
      text: text.trim(),
      imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl.trim() : null,
      gymId: gymId && gymId.trim() !== '' ? gymId.trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : (parseInt(String(sortOrder)) || 0),
    });

    const testimonialData = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        text: text.trim(),
        imageUrl: imageUrl && imageUrl.trim() !== '' ? imageUrl.trim() : null,
        gymId: gymId && gymId.trim() !== '' ? gymId.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : (parseInt(String(sortOrder)) || 0),
      },
    });

    console.log('Testimonial created:', testimonialData);

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

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Error meta:', error?.meta);
    
    // Safely extract error message
    let errorMessage = 'Failed to create testimonial';
    try {
      if (error?.message) {
        errorMessage = String(error.message);
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.toString && typeof error.toString === 'function') {
        errorMessage = error.toString();
      }
    } catch (e) {
      errorMessage = 'Failed to create testimonial';
    }
    
    // Return a proper error message that can be serialized
    return NextResponse.json({ 
      error: errorMessage,
      message: errorMessage,
    }, { status: 500 });
  }
}

