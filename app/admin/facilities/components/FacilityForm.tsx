'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

interface Facility {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export default function FacilityForm({
  facility,
  onSuccess,
}: {
  facility: Facility | null;
  onSuccess: (newFacility?: any) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(facility?.iconUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: facility?.name || '',
      description: facility?.description || '',
    },
  });

  // Update state when facility prop changes
  useEffect(() => {
    if (facility) {
      setPreview(facility.iconUrl || null);
      setSelectedFile(null);
      reset({ name: facility.name, description: facility.description || '' });
    } else {
      setPreview(null);
      setSelectedFile(null);
      reset({ name: '', description: '' });
    }
  }, [facility, reset]);

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
    setPreview(facility?.iconUrl || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    let iconUrl = facility?.iconUrl || null;

    try {
      // If new file is selected, upload to Cloudinary first
      if (selectedFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);

        const uploadRes = await fetch('/api/admin/facilities/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadRes.ok) {
          const error = await uploadRes.json();
          throw new Error(error.error || 'Failed to upload image');
        }

        const uploadData = await uploadRes.json();
        iconUrl = uploadData.url;
      }

      // Create or update facility
      const url = facility ? `/api/admin/facilities/${facility.id}` : '/api/admin/facilities';
      const method = facility ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description || null,
          iconUrl,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save facility');
      }

      const responseData = await res.json();
      toast.success(facility ? 'Facility updated successfully' : 'Facility created successfully');
      onSuccess(responseData.facility);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="name">Facility Name *</Label>
        <Input id="name" {...register('name', { required: true })} className="h-11" placeholder="e.g., Sauna" />
      </div>

      <div className="space-y-3">
        <Label htmlFor="description">Description</Label>
        <Input id="description" {...register('description')} className="h-11" placeholder="e.g., Relax Body" />
        <p className="text-sm text-gray-500">Short description for the facility</p>
      </div>
      
      <div className="space-y-3">
        <Label>Facility Icon</Label>
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
              <p className="text-sm text-gray-600 mb-2">Upload facility icon</p>
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
          {facility ? 'Update' : 'Create'} Facility
        </Button>
      </div>
    </form>
  );
}

