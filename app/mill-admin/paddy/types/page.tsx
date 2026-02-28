'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Edit, Trash2, Loader2, Search, Package, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-simple';
import { PaddyTypeResponse } from '@/types';
import { getAllPaddyTypes } from '@/services/paddy.service';

export default function PaddyTypesPage() {
  const { toast } = useToast();
  const [types, setTypes] = useState<PaddyTypeResponse[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<PaddyTypeResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<PaddyTypeResponse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
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
            type.name.toLowerCase().includes(query) ||
            (type.description && type.description.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, types]);

  const fetchTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPaddyTypes();
      setTypes(data);
      setFilteredTypes(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load paddy types');
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'ধান প্রকার লোড করতে ব্যর্থ হয়েছে',
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
        await paddyAPI.updatePaddyType(editingType.id, formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'ধান প্রকার সফলভাবে আপডেট করা হয়েছে',
        });
      } else {
        await paddyAPI.createPaddyType(formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'ধান প্রকার সফলভাবে তৈরি করা হয়েছে',
        });
      }
      setIsDialogOpen(false);
      setEditingType(null);
      setFormData({ name: '', description: '', isActive: true });
      fetchTypes();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save paddy type';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
    }
  };

  const handleEdit = (type: PaddyTypeResponse) => {
    setEditingType(type);
    setFormData({
      name: type.name,
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
      await paddyAPI.deletePaddyType(typeToDelete);
      setIsDeleteDialogOpen(false);
      setTypeToDelete(null);
      toast({
        variant: 'success',
        title: 'সফল',
        description: 'ধান প্রকার সফলভাবে মুছে ফেলা হয়েছে',
      });
      fetchTypes();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete paddy type';
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
            <h1 className="text-3xl font-bold text-gray-900">ধান প্রকার</h1>
          </div>
          <p className="text-gray-600 mt-2">ধান প্রকার তৈরি, সম্পাদনা এবং ব্যবস্থাপনা করুন</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingType(null);
              setError(null);
              setFormData({ name: '', description: '', isActive: true });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              নতুন ধান প্রকার
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingType ? 'ধান প্রকার সম্পাদনা' : 'নতুন ধান প্রকার তৈরি'}</DialogTitle>
              <DialogDescription>
                {editingType ? 'ধান প্রকারের তথ্য আপডেট করুন' : 'একটি নতুন ধান প্রকার যোগ করুন'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">নাম *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">বিবরণ</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                      সক্রিয়
                    </Label>
                  </div>
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit">{editingType ? 'আপডেট' : 'তৈরি করুন'}</Button>
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ধান প্রকার খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">নাম</TableHead>
                <TableHead className="font-semibold">বিবরণ</TableHead>
                <TableHead className="font-semibold">স্ট্যাটাস</TableHead>
                <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredTypes || filteredTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        {searchQuery ? 'কোনো ধান প্রকার পাওয়া যায়নি' : 'কোনো ধান প্রকার নেই'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTypes.map((type) => (
                  <TableRow key={type.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{type.name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={type.description || ''}>
                      {type.description || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        type.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {type.isActive ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            সক্রিয়
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3.5 w-3.5" />
                            নিষ্ক্রিয়
                          </>
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(type)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(type.id)}
                          className="hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ধান প্রকার মুছে ফেলা</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই ধান প্রকারটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
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

