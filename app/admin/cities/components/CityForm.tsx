'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface City {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string | null;
}

export default function CityForm({
  city,
  onSuccess,
}: {
  city: City | null;
  onSuccess: (newCity?: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(city?.thumbnailUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: city?.name || '',
    },
  });

  // Update state when city prop changes
  useEffect(() => {
    if (city) {
      setPreview(city.thumbnailUrl || null);
      setSelectedFile(null);
      reset({ name: city.name });
    } else {
      setPreview(null);
      setSelectedFile(null);
      reset({ name: '' });
    }
  }, [city, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Store file and show preview
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreview(city?.thumbnailUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    let thumbnailUrl = city?.thumbnailUrl || null;

    try {
      // If new file is selected, upload to Cloudinary first
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/admin/cities/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        thumbnailUrl = uploadData.url;
      }

      // Validate thumbnail (required for new city or if updating)
      if (!thumbnailUrl) {
        toast.error('City thumbnail is required');
        setLoading(false);
        return;
      }

      // Create or update city
      const url = city ? `/api/admin/cities/${city.id}` : '/api/admin/cities';
      const method = city ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          thumbnailUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save city');
      }

      const responseData = await res.json();
      toast.success(city ? 'City updated successfully' : 'City created successfully');
      onSuccess(responseData.city);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save city');
      // If upload succeeded but create failed, the file is already in Cloudinary
      // This is acceptable as it's a rare edge case
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="name">City Name *</Label>
        <Input id="name" {...register('name', { required: true })} className="h-11" placeholder="e.g., Jakarta" />
        <p className="text-sm text-gray-500">Slug will be generated automatically from the name</p>
      </div>
      
      <div className="space-y-3">
        <Label>City Thumbnail *</Label>
        <div className="space-y-3">
          {preview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
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
              <p className="text-sm text-gray-600 mb-2">Upload city thumbnail</p>
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
        <p className="text-sm text-gray-500">Required: Square image, max 5MB</p>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {city ? 'Update' : 'Create'} City
        </Button>
      </div>
    </form>
  );
}

