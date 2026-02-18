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
import { customersAPI, Customer } from '@/lib/api';
import { Plus, Edit, Trash2, Loader2, Search, Users, AlertCircle, CheckCircle2, XCircle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-simple';

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    isActive: true,
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredCustomers(
        customers.filter(
          (customer) =>
            customer.name.toLowerCase().includes(query) ||
            customer.phone.includes(query) ||
            customer.address.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersAPI.getAll();
      const customersList = Array.isArray(data) ? data : [];
      setCustomers(customersList);
      setFilteredCustomers(customersList);
    } catch (err: any) {
      setError(err.message || 'Failed to load customers');
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: 'গ্রাহক লোড করতে ব্যর্থ হয়েছে',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingCustomer) {
        await customersAPI.update(editingCustomer.id, formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'গ্রাহক সফলভাবে আপডেট করা হয়েছে',
        });
      } else {
        await customersAPI.create(formData);
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'গ্রাহক সফলভাবে তৈরি করা হয়েছে',
        });
      }
      setIsDialogOpen(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', address: '', isActive: true });
      fetchCustomers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save customer';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
      isActive: customer.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setCustomerToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await customersAPI.delete(customerToDelete);
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
      toast({
        variant: 'success',
        title: 'সফল',
        description: 'গ্রাহক সফলভাবে মুছে ফেলা হয়েছে',
      });
      fetchCustomers();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete customer';
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
      setIsDeleteDialogOpen(false);
      setCustomerToDelete(null);
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
            <Users className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">গ্রাহক ব্যবস্থাপনা</h1>
          </div>
          <p className="text-gray-600 mt-2">গ্রাহক তৈরি, সম্পাদনা এবং ব্যবস্থাপনা করুন</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingCustomer(null);
              setError(null);
              setFormData({ name: '', phone: '', address: '', isActive: true });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              নতুন গ্রাহক
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingCustomer ? 'গ্রাহক সম্পাদনা' : 'নতুন গ্রাহক তৈরি'}</DialogTitle>
              <DialogDescription>
                {editingCustomer ? 'গ্রাহকের তথ্য আপডেট করুন' : 'একটি নতুন গ্রাহক যোগ করুন'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="phone" className="text-sm font-medium">মোবাইল</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address" className="text-sm font-medium">ঠিকানা</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                        গ্রাহক সক্রিয়
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
                <Button type="submit">{editingCustomer ? 'আপডেট' : 'তৈরি করুন'}</Button>
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
              placeholder="গ্রাহক খুঁজুন (নাম, মোবাইল, ঠিকানা)..."
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
                <TableHead className="font-semibold">মোবাইল</TableHead>
                <TableHead className="font-semibold">ঠিকানা</TableHead>
                <TableHead className="font-semibold">মোট বিক্রয়</TableHead>
                <TableHead className="font-semibold">বাকি টাকা</TableHead>
                <TableHead className="font-semibold">স্ট্যাটাস</TableHead>
                <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!filteredCustomers || filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        {searchQuery ? 'কোনো গ্রাহক পাওয়া যায়নি' : 'কোনো গ্রাহক নেই'}
                      </p>
                      {!searchQuery && (
                        <p className="text-sm text-gray-400 mt-1">নতুন গ্রাহক তৈরি করতে উপরের বাটন ব্যবহার করুন</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate" title={customer.address}>
                      {customer.address || '-'}
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700">৳{customer.totalSales?.toLocaleString() || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${customer.totalDue && customer.totalDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ৳{customer.totalDue?.toLocaleString() || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.isActive ? (
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
                          onClick={() => handleEdit(customer)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(customer.id)}
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
        {filteredCustomers && filteredCustomers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
            মোট {filteredCustomers.length} জন গ্রাহক {searchQuery && `(${customers.length} জনের মধ্যে)`}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>গ্রাহক মুছে ফেলা</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই গ্রাহকটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCustomerToDelete(null);
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

