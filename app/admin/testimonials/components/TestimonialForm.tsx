'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
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

export default function TestimonialForm({
  testimonial,
  gyms,
  onSuccess,
}: {
  testimonial: Testimonial | null;
  gyms: Gym[];
  onSuccess: (newTestimonial?: Testimonial) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(testimonial?.imageUrl || null);
  const [selectedGymId, setSelectedGymId] = useState<string>(testimonial?.gymId || 'none');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      name: testimonial?.name || '',
      role: testimonial?.role || '',
      text: testimonial?.text || '',
      isActive: testimonial?.isActive !== undefined ? testimonial.isActive : true,
      sortOrder: testimonial?.sortOrder || 0,
    },
  });

  const isActive = watch('isActive');

  // Update state when testimonial prop changes
  useEffect(() => {
    if (testimonial) {
      setPreview(testimonial.imageUrl || null);
      setSelectedFile(null);
      setSelectedGymId(testimonial.gymId || 'none');
      reset({
        name: testimonial.name,
        role: testimonial.role,
        text: testimonial.text,
        isActive: testimonial.isActive,
        sortOrder: testimonial.sortOrder,
      });
    } else {
      setPreview(null);
      setSelectedFile(null);
      setSelectedGymId('none');
      reset({
        name: '',
        role: '',
        text: '',
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [testimonial, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(testimonial?.imageUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    let imageUrl = testimonial?.imageUrl || null;

    try {
      // If new file is selected, upload to Cloudinary
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/admin/testimonials/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
      }

      const payload = {
        name: data.name.trim(),
        role: data.role.trim(),
        text: data.text.trim(),
        imageUrl,
        gymId: selectedGymId && selectedGymId !== 'none' ? selectedGymId : null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : (parseInt(String(data.sortOrder)) || 0),
      };

      const url = testimonial ? `/api/admin/testimonials/${testimonial.id}` : '/api/admin/testimonials';
      const method = testimonial ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to save testimonial';
        try {
          const error = await res.json();
          console.error('API Error Response:', error);
          errorMessage = error.error || error.details || error.message || JSON.stringify(error) || 'Failed to save testimonial';
        } catch (parseError) {
          // If response is not JSON, try to get text
          try {
            const text = await res.text();
            errorMessage = text || `HTTP ${res.status}: ${res.statusText}`;
          } catch (textError) {
            errorMessage = `HTTP ${res.status}: ${res.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const responseData = await res.json();
      toast.success(testimonial ? 'Testimonial updated successfully' : 'Testimonial created successfully');
      onSuccess(responseData.testimonial);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save testimonial');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" {...register('name', { required: true })} className="h-11" placeholder="e.g., John Doe" />
        </div>
        <div className="space-y-3">
          <Label htmlFor="role">Role *</Label>
          <Input id="role" {...register('role', { required: true })} className="h-11" placeholder="e.g., Product Manager" />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="gymId">Gym (Optional)</Label>
        <Select value={selectedGymId || 'none'} onValueChange={(value) => setSelectedGymId(value === 'none' ? '' : value)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select a gym (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No gym (General testimonial)</SelectItem>
            {gyms.map((gym) => (
              <SelectItem key={gym.id} value={gym.id}>
                {gym.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="text">Testimonial Text *</Label>
        <Textarea
          id="text"
          {...register('text', { required: true })}
          className="min-h-[120px]"
          placeholder="Enter testimonial text..."
        />
      </div>

      <div className="space-y-3">
        <Label>Profile Image (Optional)</Label>
        <div className="space-y-3">
          {preview ? (
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">Upload profile image</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                Choose File
              </Button>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-sm text-gray-500">Optional: Square image, max 5MB</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="sortOrder">Sort Order</Label>
          <Input
            id="sortOrder"
            type="number"
            {...register('sortOrder', { valueAsNumber: true })}
            className="h-11"
            placeholder="0"
          />
          <p className="text-sm text-gray-500">Lower numbers appear first</p>
        </div>
        <div className="flex items-center space-x-3 py-2">
          <input
            type="checkbox"
            id="isActive"
            {...register('isActive')}
            className="rounded w-4 h-4"
          />
          <Label htmlFor="isActive" className="cursor-pointer">
            Active (Show on frontend)
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {testimonial ? 'Update' : 'Create'} Testimonial
        </Button>
      </div>
    </form>
  );
}

