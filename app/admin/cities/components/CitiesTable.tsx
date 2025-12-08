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
import CityForm from './CityForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface City {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string | null;
  _count: {
    gyms: number;
  };
}

export default function CitiesTable({ initialCities }: { initialCities: City[] }) {
  const router = useRouter();
  const [cities, setCities] = useState(initialCities);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);

  // Filter cities based on search query (starts with)
  const filteredCities = cities.filter((city) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      city.name.toLowerCase().startsWith(query) ||
      city.slug.toLowerCase().startsWith(query)
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this city?')) return;

    try {
      const res = await fetch(`/api/admin/cities/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete city');

      toast.success('City deleted successfully');
      router.refresh();
      setCities(cities.filter((c) => c.id !== id));
    } catch (error) {
      toast.error('Failed to delete city');
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingCity(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = async (newCity?: any) => {
    setIsDialogOpen(false);
    
    // Store editingCity before clearing it
    const wasEditing = editingCity;
    setEditingCity(null);
    
    // Fetch fresh data from server to ensure sync
    try {
      const res = await fetch('/api/admin/cities');
      if (res.ok) {
        const data = await res.json();
        setCities(data.cities);
      } else {
        // Fallback: update local state if fetch fails
        if (newCity) {
          if (wasEditing) {
            setCities(cities.map((c) => 
              c.id === wasEditing.id 
                ? { ...newCity, _count: newCity._count || c._count } 
                : c
            ));
          } else {
            const cityWithCount = {
              ...newCity,
              _count: newCity._count || { gyms: 0 },
            };
            setCities([...cities, cityWithCount].sort((a, b) => a.name.localeCompare(b.name)));
          }
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      // Fallback: update local state if fetch fails
      if (newCity) {
        if (wasEditing) {
          setCities(cities.map((c) => 
            c.id === wasEditing.id 
              ? { ...newCity, _count: newCity._count || c._count } 
              : c
          ));
        } else {
          const cityWithCount = {
            ...newCity,
            _count: newCity._count || { gyms: 0 },
          };
          setCities([...cities, cityWithCount].sort((a, b) => a.name.localeCompare(b.name)));
        }
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 sm:px-10 py-8 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">All Cities</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={handleCreate} 
                className="bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add City
              </Button>
            </DialogTrigger>
            <DialogContent className="p-6">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold">{editingCity ? 'Edit City' : 'Create New City'}</DialogTitle>
              </DialogHeader>
              <CityForm city={editingCity} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search cities by name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 w-full max-w-md"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50">
              <TableHead className="px-8 py-5 font-semibold text-gray-900">Thumbnail</TableHead>
              <TableHead className="px-8 py-5 font-semibold text-gray-900">Name</TableHead>
              <TableHead className="px-8 py-5 font-semibold text-gray-900">Slug</TableHead>
              <TableHead className="px-8 py-5 font-semibold text-gray-900">Gyms</TableHead>
              <TableHead className="px-8 py-5 font-semibold text-gray-900 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-16 px-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-lg font-medium">
                      {searchQuery ? 'No cities found matching your search' : 'No cities found'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {searchQuery ? 'Try a different search term' : 'Create your first city to get started!'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCities.map((city) => (
                <TableRow key={city.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-8 py-5">
                    {city.thumbnailUrl ? (
                      <div className="w-12 h-12 rounded-full overflow-hidden relative">
                        <Image
                          src={city.thumbnailUrl}
                          alt={city.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-8 py-5 font-medium text-gray-900">{city.name}</TableCell>
                  <TableCell className="px-8 py-5 text-gray-500">{city.slug}</TableCell>
                  <TableCell className="px-8 py-5 text-gray-600">{city._count.gyms}</TableCell>
                  <TableCell className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(city)}
                        className="h-9 w-9 hover:bg-gray-100"
                      >
                        <Pencil className="h-4 w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(city.id)}
                        className="h-9 w-9 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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

