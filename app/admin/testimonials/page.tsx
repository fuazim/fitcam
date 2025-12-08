import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/auth';
import TestimonialsTable from './components/TestimonialsTable';

export default async function TestimonialsPage() {
  await requireAdmin();

  const [testimonials, gyms] = await Promise.all([
    prisma.testimonial.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    }).then(async (testimonials) => {
      // Manually fetch gym data for each testimonial
      const testimonialsWithGym = await Promise.all(
        testimonials.map(async (testimonial) => {
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
      return testimonialsWithGym;
    }),
    prisma.gym.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    }),
  ]);

  return (
    <div className="w-full space-y-6 sm:space-y-8 md:space-y-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Testimonials</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage customer testimonials</p>
      </div>
      <TestimonialsTable initialTestimonials={testimonials} gyms={gyms} />
    </div>
  );
}

