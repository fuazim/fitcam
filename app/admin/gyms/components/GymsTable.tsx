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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import GymForm from './GymForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
  cityId: string;
  city: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{ url: string; sortOrder: number }>;
  facilities?: Array<{ facilityId: string; facility: { id: string; name: string } }>;
}

interface City {
  id: string;
  name: string;
  slug: string;
}

interface Facility {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
}

export default function GymsTable({
  initialGyms,
  cities,
  facilities,
}: {
  initialGyms: Gym[];
  cities: City[];
  facilities: Facility[];
}) {
  const router = useRouter();
  const [gyms, setGyms] = useState(initialGyms);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');

  // Filter gyms based on search query and city
  const filteredGyms = gyms.filter((gym) => {
    // Filter by search query (starts with)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = gym.name.toLowerCase().startsWith(query);
      const locationMatch = gym.locationText.toLowerCase().startsWith(query);
      if (!nameMatch && !locationMatch) return false;
    }

    // Filter by city
    if (selectedCityId !== 'all' && gym.cityId !== selectedCityId) {
      return false;
    }

    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gym?')) return;

    try {
      const res = await fetch(`/api/admin/gyms/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete gym');

      toast.success('Gym deleted successfully');
      router.refresh();
      setGyms(gyms.filter((g) => g.id !== id));
    } catch (error) {
      toast.error('Failed to delete gym');
    }
  };

  const handleEdit = (gym: Gym) => {
    setEditingGym(gym);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingGym(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = async (newGym?: any) => {
    setIsDialogOpen(false);
    
    // Store editingGym before clearing it
    const wasEditing = editingGym;
    setEditingGym(null);
    
    // Fetch fresh data from server to ensure sync
    try {
      const res = await fetch('/api/admin/gyms');
      if (res.ok) {
        const data = await res.json();
        setGyms(data.gyms);
      } else {
        // Fallback: refresh if fetch fails
        router.refresh();
      }
    } catch (error) {
      // Fallback: refresh if fetch fails
      router.refresh();
    }
  };

  return (
    <>
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 sm:px-10 py-8 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">All Gyms</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleCreate} 
                className="bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Gym
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-6">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold">{editingGym ? 'Edit Gym' : 'Create New Gym'}</DialogTitle>
              </DialogHeader>
              <GymForm
                key={editingGym?.id || 'new'}
                gym={editingGym}
                cities={cities}
                facilities={facilities}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
          </div>
          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 z-10" />
              <Input
                type="text"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 w-full"
              />
            </div>
            {/* City Filter */}
            <div className="w-full sm:w-[200px]">
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger className="!h-11 w-full" style={{ minHeight: '44px', maxHeight: '44px' }}>
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="px-8 py-5 font-semibold text-gray-900">Name</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-gray-900">Location</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-gray-900">City</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-gray-900">Popular</TableHead>
                <TableHead className="px-8 py-5 font-semibold text-gray-900 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGyms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-16 px-6">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-lg font-medium">
                        {gyms.length === 0 
                          ? 'No gyms found' 
                          : 'No gyms match your search'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {gyms.length === 0 
                          ? 'Create your first gym to get started!' 
                          : 'Try adjusting your search or filter'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGyms.map((gym) => {
                  // Truncate location text for display
                  const truncatedLocation = gym.locationText.length > 30 
                    ? gym.locationText.substring(0, 30) + '...' 
                    : gym.locationText;
                  
                  return (
                    <TableRow key={gym.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell className="px-8 py-5 font-medium text-gray-900">{gym.name}</TableCell>
                      <TableCell className="px-8 py-5 text-gray-600" title={gym.locationText}>
                        {truncatedLocation}
                      </TableCell>
                      <TableCell className="px-8 py-5 text-gray-600">{gym.city.name}</TableCell>
                      <TableCell className="px-8 py-5">
                        {gym.isPopular ? (
                          <span className="px-3 py-1.5 bg-fitcamp-purple text-white text-xs font-medium rounded-full">
                            Popular
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(gym)}
                            className="h-9 w-9 hover:bg-gray-100"
                          >
                            <Pencil className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(gym.id)}
                            className="h-9 w-9 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

