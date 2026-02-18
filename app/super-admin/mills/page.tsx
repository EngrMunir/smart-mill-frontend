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
import { millsAPI, Mill } from '@/lib/api';
import { Plus, Edit, Trash2, Loader2, Search, Building2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-simple';

export default function MillsPage() {
  const { toast } = useToast();
  const [mills, setMills] = useState<Mill[]>([]);
  const [filteredMills, setFilteredMills] = useState<Mill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [millToDelete, setMillToDelete] = useState<number | null>(null);
  const [editingMill, setEditingMill] = useState<Mill | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    isActive: true,
  });

  useEffect(() => {
    fetchMills();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMills(mills);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredMills(
        mills.filter(
          (mill) =>
            mill.name.toLowerCase().includes(query) ||
            mill.address.toLowerCase().includes(query) ||
            mill.phone.includes(query) ||
            (mill.email && mill.email.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, mills]);

  const fetchMills = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await millsAPI.getAll();
      const millsData = data || [];
      setMills(millsData);
      setFilteredMills(millsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load mills');
      setMills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingMill) {
        await millsAPI.update(editingMill.id, formData);
      } else {
        await millsAPI.create(formData);
      }
      setIsDialogOpen(false);
      setEditingMill(null);
      setFormData({ name: '', address: '', phone: '', email: '', isActive: true });
      toast({
        variant: 'success',
        title: 'সফল',
        description: editingMill ? 'মিল সফলভাবে আপডেট করা হয়েছে' : 'মিল সফলভাবে তৈরি করা হয়েছে',
      });
      fetchMills();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save mill';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
    }
  };

  const handleEdit = (mill: Mill) => {
    setEditingMill(mill);
    setFormData({
      name: mill.name,
      address: mill.address,
      phone: mill.phone,
      email: mill.email || '',
      isActive: mill.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setMillToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!millToDelete) return;
    try {
      await millsAPI.delete(millToDelete);
      setIsDeleteDialogOpen(false);
      setMillToDelete(null);
      toast({
        variant: 'success',
        title: 'সফল',
        description: 'মিল সফলভাবে মুছে ফেলা হয়েছে',
      });
      fetchMills();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete mill';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
      setIsDeleteDialogOpen(false);
      setMillToDelete(null);
    }
  };

  const handleToggleActive = async (mill: Mill) => {
    try {
      await millsAPI.update(mill.id, { isActive: !mill.isActive });
      toast({
        variant: 'success',
        title: 'সফল',
        description: `মিল ${!mill.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`,
      });
      fetchMills();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update mill';
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
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
            <Building2 className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">মিল ব্যবস্থাপনা</h1>
          </div>
          <p className="text-gray-600 mt-2">মিল তৈরি, সম্পাদনা এবং ব্যবস্থাপনা করুন</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingMill(null);
              setFormData({ name: '', address: '', phone: '', email: '', isActive: true });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              নতুন মিল
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingMill ? 'মিল সম্পাদনা' : 'নতুন মিল তৈরি'}</DialogTitle>
              <DialogDescription>
                {editingMill ? 'মিলের তথ্য আপডেট করুন' : 'একটি নতুন মিল যোগ করুন'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium">মিলের নাম *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">ঠিকানা *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">মোবাইল *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">ইমেইল</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 bg-gray-50">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <Label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
                        মিল সক্রিয়
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
              {error && (
                <Alert variant="destructive" className="mb-4 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  বাতিল
                </Button>
                <Button type="submit">{editingMill ? 'আপডেট' : 'তৈরি করুন'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="মিল খুঁজুন (নাম, ঠিকানা, মোবাইল, ইমেইল)..."
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
                <TableHead className="font-semibold">ঠিকানা</TableHead>
                <TableHead className="font-semibold">মোবাইল</TableHead>
                <TableHead className="font-semibold">ইমেইল</TableHead>
                <TableHead className="font-semibold">স্ট্যাটাস</TableHead>
                <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredMills || filteredMills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        {searchQuery ? 'কোনো মিল পাওয়া যায়নি' : 'কোনো মিল নেই'}
                      </p>
                      {!searchQuery && (
                        <p className="text-sm text-gray-400 mt-1">নতুন মিল তৈরি করতে উপরের বাটন ব্যবহার করুন</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMills.map((mill) => (
                  <TableRow key={mill.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{mill.name}</TableCell>
                    <TableCell className="max-w-xs truncate" title={mill.address}>
                      {mill.address}
                    </TableCell>
                    <TableCell>{mill.phone}</TableCell>
                    <TableCell>{mill.email || <span className="text-gray-400">-</span>}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleToggleActive(mill)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          mill.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {mill.isActive ? (
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
                      </button>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(mill)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(mill.id)}
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
        {filteredMills && filteredMills.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
            মোট {filteredMills.length} টি মিল {searchQuery && `(${mills.length} টির মধ্যে)`}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>মিল মুছে ফেলা</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই মিলটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setMillToDelete(null);
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




