'use client';

import { useState, useEffect } from 'react';
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
import FacilityForm from './FacilityForm';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Facility {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  _count: {
    gyms: number;
  };
}

export default function FacilitiesTable({ initialFacilities }: { initialFacilities: Facility[] }) {
  const router = useRouter();
  // Ensure all facilities have _count
  const normalizedFacilities = initialFacilities.map((f) => ({
    ...f,
    _count: f._count || { gyms: 0 },
  }));
  const [facilities, setFacilities] = useState<Facility[]>(normalizedFacilities);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  // Filter facilities based on search query (starts with)
  const filteredFacilities = facilities.filter((facility) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      facility.name.toLowerCase().startsWith(query) ||
      (facility.description && facility.description.toLowerCase().startsWith(query))
    );
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this facility?')) return;

    try {
      const res = await fetch(`/api/admin/facilities/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete facility');

      toast.success('Facility deleted successfully');
      // Fetch fresh data from server to ensure sync
      const fetchRes = await fetch('/api/admin/facilities');
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        // Ensure all facilities have _count
        const facilitiesWithCount = data.facilities.map((f: any) => ({
          ...f,
          _count: f._count || { gyms: 0 },
        }));
        setFacilities(facilitiesWithCount);
      } else {
        setFacilities(facilities.filter((f) => f.id !== id)); // Fallback to local filter
      }
    } catch (error) {
      toast.error('Failed to delete facility');
    }
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingFacility(null);
    setIsDialogOpen(true);
  };

  const handleSuccess = async (newFacility?: Facility) => {
    setIsDialogOpen(false);
    const currentEditingFacility = editingFacility; // Store before setting to null
    setEditingFacility(null);

    // Fetch fresh data from server to ensure sync
    try {
      const res = await fetch('/api/admin/facilities');
      if (res.ok) {
        const data = await res.json();
        // Ensure all facilities have _count
        const facilitiesWithCount = data.facilities.map((f: any) => ({
          ...f,
          _count: f._count || { gyms: 0 },
        }));
        setFacilities(facilitiesWithCount);
      } else {
        // Fallback: update local state if fetch fails
        if (newFacility) {
          if (currentEditingFacility) {
            setFacilities(facilities.map((f) =>
              f.id === currentEditingFacility.id
                ? { ...newFacility, _count: newFacility._count || f._count }
                : f
            ));
          } else {
            const facilityWithCount = {
              ...newFacility,
              _count: newFacility._count || { gyms: 0 },
            };
            setFacilities([...facilities, facilityWithCount].sort((a, b) => a.name.localeCompare(b.name)));
          }
        } else {
          router.refresh();
        }
      }
    } catch (error) {
      // Fallback: update local state if fetch fails
      if (newFacility) {
        if (currentEditingFacility) {
          setFacilities(facilities.map((f) =>
            f.id === currentEditingFacility.id
              ? { ...newFacility, _count: newFacility._count || f._count }
              : f
          ));
        } else {
          const facilityWithCount = {
            ...newFacility,
            _count: newFacility._count || { gyms: 0 },
          };
          setFacilities([...facilities, facilityWithCount].sort((a, b) => a.name.localeCompare(b.name)));
        }
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-6 md:py-8 border-b border-gray-200 bg-white">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">All Facilities</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleCreate}
                className="w-full sm:w-fit bg-fitcamp-royal-blue hover:bg-fitcamp-royal-blue/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Facility
              </Button>
            </DialogTrigger>
            <DialogContent className="p-4 sm:p-6">
              <DialogHeader className="pb-4 sm:pb-6">
                <DialogTitle className="text-xl sm:text-2xl font-bold">{editingFacility ? 'Edit Facility' : 'Create New Facility'}</DialogTitle>
              </DialogHeader>
              <FacilityForm facility={editingFacility} onSuccess={handleSuccess} />
            </DialogContent>
          </Dialog>
        </div>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
          <Input
            type="text"
            placeholder="Search facilities by name or description..."
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
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Icon</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Name</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Description</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-xs sm:text-sm">Gyms</TableHead>
              <TableHead className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-semibold text-gray-900 text-right text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFacilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-12 sm:py-16 px-4 sm:px-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p className="text-lg font-medium">
                      {searchQuery ? 'No facilities found matching your search' : 'No facilities found'}
                    </p>
                    {!searchQuery && (
                      <p className="text-sm text-gray-400">Create your first facility to get started!</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredFacilities.map((facility) => (
                <TableRow key={facility.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5">
                    {facility.iconUrl ? (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden relative">
                        <Image
                          src={facility.iconUrl}
                          alt={facility.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">{facility.name.charAt(0)}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 font-medium text-gray-900 text-xs sm:text-sm">{facility.name}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{facility.description || '-'}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-gray-600 text-xs sm:text-sm">{facility._count?.gyms ?? 0}</TableCell>
                  <TableCell className="px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-right">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(facility)}
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-gray-100"
                      >
                        <Pencil className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(facility.id)}
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

