import { getTestimonials } from '@/app/actions/testimonial';
import { Metadata } from 'next';
import TestimonialListClient from '@/components/admin/testimonials/testimonial-list';

export const metadata: Metadata = {
  title: 'Manage Testimonials - Admin',
};

export default async function AdminTestimonialsPage() {
  const { testimonials, error } = await getTestimonials();

  if (error) {
    return (
      <div className="p-8 text-red-400">
        <p>Fetch failed: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-8">
      <header className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
        <p className="text-zinc-400 mt-1">
          Client endorsements and quotes.
        </p>
      </header>

      <main>
        <TestimonialListClient initialTestimonials={testimonials || []} />
      </main>
    </div>
  );
}
