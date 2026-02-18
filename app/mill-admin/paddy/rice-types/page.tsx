'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { paddyAPI, RiceTypeResponse } from '@/lib/api';
import { Plus, Edit, Trash2, Loader2, Search, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-simple';

export default function RiceTypesPage() {
  const { toast } = useToast();
  const [types, setTypes] = useState<RiceTypeResponse[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<RiceTypeResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<RiceTypeResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    defaultBostaSize: 25,
    description: '',
    isActive: true, // Keep for API but don't show in UI
  });

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTypes(types);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredTypes(
        types.filter(
          (type) =>
            type.name.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, types]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paddyAPI.getAllRiceTypes();
      const typesList = Array.isArray(data) ? data : [];
      setTypes(typesList);
      setFilteredTypes(typesList);
    } catch (err: any) {
      setError(err.message || 'Failed to load rice types');
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'চাল প্রকার লোড করতে ব্যর্থ হয়েছে',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingType) {
        await paddyAPI.updateRiceType(editingType.id, formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'চাল প্রকার সফলভাবে আপডেট করা হয়েছে',
        });
      } else {
        await paddyAPI.createRiceType(formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'চাল প্রকার সফলভাবে তৈরি করা হয়েছে',
        });
      }
      setIsDialogOpen(false);
      setEditingType(null);
      setFormData({ name: '', defaultBostaSize: 25, description: '', isActive: true }); // Keep for API
      fetchTypes();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save rice type';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
    }
  };

  const handleEdit = (type: RiceTypeResponse) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      defaultBostaSize: type.defaultBostaSize,
      description: type.description || '',
      isActive: type.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setTypeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!typeToDelete) return;
    try {
      await paddyAPI.deleteRiceType(typeToDelete);
      setIsDeleteDialogOpen(false);
      setTypeToDelete(null);
      toast({
        variant: 'success',
        title: 'সফল',
        description: 'চাল প্রকার সফলভাবে মুছে ফেলা হয়েছে',
      });
      fetchTypes();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete rice type';
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
      setIsDeleteDialogOpen(false);
      setTypeToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">চাল প্রকার</h1>
          </div>
          <p className="text-gray-600 mt-2">চাল প্রকার তৈরি, সম্পাদনা এবং ব্যবস্থাপনা করুন</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingType(null);
                setError(null);
                setFormData({ name: '', defaultBostaSize: 25, description: '', isActive: true }); // Keep for API
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="mr-2 h-4 w-4" />
              নতুন চাল প্রকার
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingType ? 'চাল প্রকার সম্পাদনা' : 'নতুন চাল প্রকার তৈরি'}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {editingType ? 'চাল প্রকারের তথ্য আপডেট করুন' : 'একটি নতুন চাল প্রকার যোগ করুন'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">নাম *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1 h-11 text-base"
                    placeholder="চাল প্রকারের নাম লিখুন"
                  />
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <DialogFooter className="gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  className="hover:bg-gray-50"
                >
                  বাতিল
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingType ? 'আপডেট করুন' : 'তৈরি করুন'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="চাল প্রকার খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700 py-4">নাম</TableHead>
                <TableHead className="font-semibold text-right text-gray-700 py-4">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredTypes || filteredTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-16">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-gray-100 rounded-full p-4 mb-4">
                        <Package className="h-10 w-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 font-medium text-lg mb-1">
                        {searchQuery ? 'কোনো চাল প্রকার পাওয়া যায়নি' : 'কোনো চাল প্রকার নেই'}
                      </p>
                      {!searchQuery && (
                        <p className="text-sm text-gray-500">নতুন চাল প্রকার যোগ করতে উপরের বাটন ব্যবহার করুন</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTypes.map((type, index) => (
                  <TableRow 
                    key={type.id} 
                    className="hover:bg-blue-50/50 transition-all duration-200 border-b border-gray-100"
                  >
                    <TableCell className="font-medium text-gray-900 py-4 text-base">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <span>{type.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(type)}
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-1.5" />
                          সম্পাদনা
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(type.id)}
                          className="hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" />
                          মুছুন
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredTypes && filteredTypes.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-200 bg-gray-50/50">
            <p className="text-sm text-gray-600">
              মোট <span className="font-semibold text-gray-900">{filteredTypes.length}</span> টি চাল প্রকার
              {searchQuery && types.length !== filteredTypes.length && (
                <span className="text-gray-500"> ({types.length} টির মধ্যে)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>চাল প্রকার মুছে ফেলা</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই চাল প্রকারটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTypeToDelete(null);
              }}
            >
              বাতিল
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
              মুছে ফেলুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

