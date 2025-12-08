'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Plus, X } from 'lucide-react';
import Image from 'next/image';

interface Gym {
  id: string;
  name: string;
  slug: string;
  locationText: string;
      address: string | null;
  mainImageUrl: string | null;
  thumbnailUrl: string | null;
  isPopular: boolean;
  openingStartTime: string | null;
  openingEndTime: string | null;
  contactPersonName: string | null;
  contactPersonPhone: string | null;
  cityId: string;
  facilities?: Array<{ facilityId: string; facility?: { id: string; name: string; iconUrl: string | null } }>;
  images?: Array<{ url: string; sortOrder: number }>;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface Facility {
  id: string;
  name: string;
  iconUrl: string | null;
}

interface GymImage {
  url: string;
  file: File | null;
  sortOrder: number;
}

export default function GymForm({
  gym,
  cities,
  facilities,
  onSuccess,
}: {
  gym: Gym | null;
  cities: City[];
  facilities: Facility[];
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    gym?.facilities?.map((f) => f.facilityId) || []
  );
  const [gymImages, setGymImages] = useState<GymImage[]>(
    gym?.images?.map((img, index) => ({ url: img.url, file: null, sortOrder: img.sortOrder ?? index })) || []
  );
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: gym?.name || '',
      slug: gym?.slug || '',
      locationText: gym?.locationText || '',
      address: gym?.address || '',
      cityId: gym?.cityId || '',
      isPopular: gym?.isPopular || false,
      openingStartTime: gym?.openingStartTime || '08:00',
      openingEndTime: gym?.openingEndTime || '21:00',
      contactPersonName: gym?.contactPersonName || '',
      contactPersonPhone: gym?.contactPersonPhone || '',
    },
  });

  const cityId = watch('cityId');

  // Update state when gym prop changes
  useEffect(() => {
    if (gym) {
      // Update images - ensure we have all images with correct sortOrder
      const images = gym.images && gym.images.length > 0
        ? gym.images.map((img) => ({ 
            url: img.url, 
            file: null, 
            sortOrder: img.sortOrder ?? 0 
          }))
        : [];
      setGymImages(images);
      
      // Update facilities - extract facilityId from facilities array
      const facilityIds = gym.facilities && gym.facilities.length > 0
        ? gym.facilities.map((f) => f.facilityId)
        : [];
      setSelectedFacilities(facilityIds);
      
      // Update form values
      reset({
        name: gym.name,
        slug: gym.slug,
        locationText: gym.locationText,
        address: gym.address || '',
        cityId: gym.cityId,
        isPopular: gym.isPopular,
        openingStartTime: gym.openingStartTime || '08:00',
        openingEndTime: gym.openingEndTime || '21:00',
        contactPersonName: gym.contactPersonName || '',
        contactPersonPhone: gym.contactPersonPhone || '',
      });
    } else {
      setGymImages([]);
      setSelectedFacilities([]);
      reset({
        name: '',
        slug: '',
        locationText: '',
        address: '',
        cityId: '',
        isPopular: false,
        openingStartTime: '08:00',
        openingEndTime: '21:00',
        contactPersonName: '',
        contactPersonPhone: '',
      });
    }
  }, [gym, reset]);

  // Auto-generate slug from name
  useEffect(() => {
    const name = watch('name');
    if (name && !gym) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [watch('name'), gym, setValue]);

  const handleImageAdd = () => {
    if (gymImages.length >= 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    imageInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (gymImages.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      setGymImages((prev) => [
        ...prev,
        {
          url: URL.createObjectURL(file),
          file,
          sortOrder: prev.length,
        },
      ]);
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleImageRemove = (index: number) => {
    setGymImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      return newImages.map((img, i) => ({ ...img, sortOrder: i }));
    });
  };

  const onSubmit = async (data: any) => {
    // Validate images
    if (gymImages.length < 3) {
      toast.error('Minimum 3 images required');
      return;
    }

    if (gymImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setLoading(true);
    try {
      // Upload gym images to Cloudinary
      const uploadedImages: Array<{ url: string; sortOrder: number }> = [];
      for (let i = 0; i < gymImages.length; i++) {
        const image = gymImages[i];
        let imageUrl = image.url;

        // If it's a new file, upload to Cloudinary
        if (image.file) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', image.file);

          const uploadRes = await fetch('/api/admin/gyms/upload', {
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

        uploadedImages.push({
          url: imageUrl,
          sortOrder: i,
        });
      }

      // Use selected facilities
      const allFacilityIds = selectedFacilities;

      // Set mainImageUrl and thumbnailUrl from first image
      const mainImageUrl = uploadedImages[0]?.url || null;
      const thumbnailUrl = uploadedImages[0]?.url || null;

      const payload = {
        ...data,
        mainImageUrl,
        thumbnailUrl,
        facilityIds: allFacilityIds,
        images: uploadedImages,
      };

      const url = gym ? `/api/admin/gyms/${gym.id}` : '/api/admin/gyms';
      const method = gym ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save gym');
      }

      const responseData = await res.json();
      toast.success(gym ? 'Gym updated successfully' : 'Gym created successfully');
      onSuccess(responseData.gym);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save gym');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="name">Gym Name *</Label>
          <Input id="name" {...register('name', { required: true })} className="h-11" />
          <p className="text-sm text-gray-500">Slug will be generated automatically</p>
        </div>
        <div className="space-y-3">
          <Label htmlFor="slug">Slug *</Label>
          <Input id="slug" {...register('slug', { required: true })} className="h-11" readOnly />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="cityId">City *</Label>
        <Select value={cityId} onValueChange={(value) => setValue('cityId', value)}>
          <SelectTrigger className="h-11">
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label htmlFor="locationText">Location Text *</Label>
        <Input
          id="locationText"
          {...register('locationText', { required: true })}
          className="h-11"
          placeholder="e.g., Senayan, Jakarta Selatan"
        />
        <p className="text-sm text-gray-500">Short location (will be truncated in display if too long)</p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="address">Address (Full Location)</Label>
        <Textarea id="address" {...register('address')} className="min-h-[100px]" placeholder="Full address..." />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="openingStartTime">Opening Time</Label>
          <Input id="openingStartTime" type="time" {...register('openingStartTime')} className="h-11" />
        </div>
        <div className="space-y-3">
          <Label htmlFor="openingEndTime">Closing Time</Label>
          <Input id="openingEndTime" type="time" {...register('openingEndTime')} className="h-11" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="contactPersonName">Contact Person Name</Label>
          <Input id="contactPersonName" {...register('contactPersonName')} className="h-11" placeholder="e.g., Lili Marlili Trilili" />
        </div>
        <div className="space-y-3">
          <Label htmlFor="contactPersonPhone">Contact Person Phone</Label>
          <Input id="contactPersonPhone" {...register('contactPersonPhone')} className="h-11" placeholder="e.g., 021-256-7854" />
        </div>
      </div>

      {/* Multiple Images Section */}
      <div className="space-y-3">
        <Label>
          Gym Images * (Min 3, Max 5)
          <span className="text-sm text-gray-500 ml-2">({gymImages.length}/5)</span>
        </Label>
        <div className="grid grid-cols-3 gap-4">
          {gymImages.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200">
                <Image src={image.url} alt={`Gym image ${index + 1}`} fill className="object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleImageRemove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">Image {index + 1}</p>
            </div>
          ))}
          {gymImages.length < 5 && (
            <button
              type="button"
              onClick={handleImageAdd}
              className="flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
            >
              <Plus className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">Add Image</span>
            </button>
          )}
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          className="hidden"
        />
        {gymImages.length < 3 && (
          <p className="text-sm text-red-500">Minimum 3 images required</p>
        )}
      </div>

      {/* Facilities Section */}
      <div className="space-y-3">
        <Label>Facilities</Label>
        <p className="text-sm text-gray-500">Select facilities available at this gym. Create new facilities in the Facilities section.</p>
        
        {/* Facilities Checkboxes */}
        {facilities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
            {facilities.map((facility) => (
              <label key={facility.id} className="flex items-center space-x-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={selectedFacilities.includes(facility.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedFacilities([...selectedFacilities, facility.id]);
                    } else {
                      setSelectedFacilities(selectedFacilities.filter((id) => id !== facility.id));
                    }
                  }}
                  className="rounded w-4 h-4"
                />
                <span className="text-sm">{facility.name}</span>
              </label>
            ))}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-500">
            <p className="text-sm">No facilities available. Create facilities in the Facilities section first.</p>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3 py-2">
        <input
          type="checkbox"
          id="isPopular"
          {...register('isPopular')}
          className="rounded w-4 h-4"
        />
        <Label htmlFor="isPopular" className="cursor-pointer">
          Mark as Popular
        </Label>
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
          {gym ? 'Update' : 'Create'} Gym
        </Button>
      </div>
    </form>
  );
}
