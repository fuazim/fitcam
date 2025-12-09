'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import TestimonialForm from './TestimonialForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  imageUrl: string | null;
  gymId: string | null;
  isActive: boolean;
  sortOrder: number;
  gym?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

interface Gym {
  id: string;
  name: string;
  slug: string;
}

export default function TestimonialsTable({ 
  initialTestimonials,
  gyms,
}: { 
  initialTestimonials: Testimonial[];
  gyms: Gym[];
}) {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Filter testimonials based on search query (starts with)
  const filteredTestimonials = testimonials.filter((testimonial) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      testimonial.name.toLowerCase().startsWith(query) ||
      testimonial.role.toLowerCase().startsWith(query) ||
      testimonial.text.toLowerCase().includes(query) ||
      (testimonial.gym?.name.toLowerCase().startsWith(query) ?? false)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete testimonial');

      toast.success('Testimonial deleted successfully');
      // Fetch fresh data from server to ensure sync
      const fetchRes = await fetch('/api/admin/testimonials');
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setTestimonials(data.testimonials);
      } else {
        setTestimonials(testimonials.filter((t) => t.id !== id));
      }
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingTestimonial(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = async (newTestimonial?: Testimonial) => {
    setIsDialogOpen(false);
    const currentEditingTestimonial = editingTestimonial;
    setEditingTestimonial(null);

    // Fetch fresh data from server to ensure sync
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials);
      } else {
        // Fallback to local state update if fetch fails
        if (newTestimonial) {
          if (currentEditingTestimonial) {
            setTestimonials(testimonials.map((t) => (t.id === newTestimonial.id ? newTestimonial : t)));
          } else {
            setTestimonials([...testimonials, newTestimonial].sort((a, b) => a.sortOrder - b.sortOrder));
          }
        }
      }
    } catch (error) {
      console.error('Error refetching testimonials:', error);
      // Fallback to local state update if fetch fails
      if (newTestimonial) {
        if (currentEditingTestimonial) {
          setTestimonials(testimonials.map((t) => (t.id === newTestimonial.id ? newTestimonial : t)));
        } else {
          setTestimonials([...testimonials, newTestimonial].sort((a, b) => a.sortOrder - b.sortOrder));
        }
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-200 bg-white">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">All Testimonials</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleCreate}
                className="w-full sm:w-fit bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="p-4 sm:p-6 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 sm:pb-6">
                <DialogTitle className="text-xl sm:text-2xl font-bold">{editingTestimonial ? 'Edit Testimonial' : 'Create New Testimonial'}</DialogTitle>
              </DialogHeader>
              <TestimonialForm testimonial={editingTestimonial} gyms={gyms} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            type="text"
            placeholder="Search testimonials by name, role, text, or gym..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 w-full sm:max-w-md"
          />
        </div>
      </div>
      <div className="overflow-x-auto px-4 sm:px-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Image</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Name</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Role</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Gym</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Status</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-right text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-12 sm:py-16 px-4 sm:px-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-lg font-medium">
                      {searchQuery.trim() ? 'No testimonials found matching your search' : 'No testimonials found'}
                    </p>
                    {!searchQuery.trim() && (
                      <p className="text-sm text-gray-400">Create your first testimonial to get started!</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                    {testimonial.imageUrl ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden relative">
                        <Image
                          src={testimonial.imageUrl}
                          alt={testimonial.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{testimonial.name.charAt(0)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-medium text-gray-900 text-xs sm:text-sm">{testimonial.name}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{testimonial.role}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{testimonial.gym?.name || '-'}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                    {testimonial.isActive ? (
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(testimonial)}
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-gray-100"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(testimonial.id)}
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

