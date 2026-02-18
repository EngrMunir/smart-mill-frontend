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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { usersAPI, millsAPI, User, Mill } from '@/lib/api';
import { Plus, Edit, Trash2, Loader2, Search, Users, AlertCircle, Shield, UserCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-simple';

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [mills, setMills] = useState<Mill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'MILL_ADMIN' as 'SUPER_ADMIN' | 'MILL_ADMIN' | 'STAFF',
    millId: '',
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('Filter effect triggered. Users:', users, 'Length:', users?.length, 'Search:', searchQuery);
    if (!users || !Array.isArray(users)) {
      console.warn('Users is not an array:', users);
      setFilteredUsers([]);
      return;
    }
    
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.role?.toLowerCase().includes(query) ||
          (user.millId && mills.find(m => m.id === user.millId)?.name.toLowerCase().includes(query))
      );
      console.log('Filtered users:', filtered, 'Length:', filtered.length);
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users, mills]);

  const fetchMills = async () => {
    try {
      console.log('Fetching mills...');
      const millsData = await millsAPI.getAll();
      console.log('Fetched mills data:', millsData);
      const millsList = millsData || [];
      console.log('Setting mills list:', millsList, 'Length:', millsList.length);
      setMills(millsList);
      if (millsList.length === 0) {
        console.warn('No mills found in database');
      }
      return millsList;
    } catch (err: any) {
      console.error('Failed to fetch mills:', err);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: `মিল লোড করতে ব্যর্থ হয়েছে: ${err.message || 'Unknown error'}`,
      });
      setMills([]);
      return [];
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, millsData] = await Promise.all([
        usersAPI.getAll(),
        millsAPI.getAll(),
      ]);
      console.log('Raw Users data:', usersData);
      console.log('Raw Mills data:', millsData);
      const usersList = Array.isArray(usersData) ? usersData : [];
      const millsList = Array.isArray(millsData) ? millsData : [];
      console.log('Processed Users list:', usersList, 'Length:', usersList.length, 'Is Array:', Array.isArray(usersList));
      console.log('Processed Mills list:', millsList, 'Length:', millsList.length, 'Is Array:', Array.isArray(millsList));
      setUsers(usersList);
      setMills(millsList);
      setFilteredUsers(usersList);
      
      if (usersList.length === 0) {
        console.warn('No users found after processing. Check API response format.');
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      const errorMessage = err.message || 'Failed to load data';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
      setUsers([]);
      setMills([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      // Validate mill selection for non-super-admin roles
      if (formData.role !== 'SUPER_ADMIN') {
        if (!formData.millId || formData.millId.trim() === '') {
          setError('মিল নির্বাচন করা বাধ্যতামূলক');
          return;
        }
        const millIdNum = parseInt(formData.millId);
        if (isNaN(millIdNum)) {
          setError('অবৈধ মিল নির্বাচন করা হয়েছে');
          return;
        }
        if (!mills || mills.length === 0) {
          setError('কোনো মিল পাওয়া যায়নি। প্রথমে একটি মিল তৈরি করুন');
          return;
        }
      }

      if (editingUser) {
        await usersAPI.update(editingUser.id, {
          ...formData,
          millId: formData.role !== 'SUPER_ADMIN' && formData.millId 
            ? parseInt(formData.millId) 
            : undefined,
        });
      } else {
        await usersAPI.create({
          ...formData,
          millId: formData.role !== 'SUPER_ADMIN' 
            ? parseInt(formData.millId) 
            : undefined,
        });
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'MILL_ADMIN',
        millId: '',
        isActive: true,
      });
      toast({
        variant: 'success',
        title: 'সফল',
        description: editingUser ? 'ব্যবহারকারী সফলভাবে আপডেট করা হয়েছে' : 'ব্যবহারকারী সফলভাবে তৈরি করা হয়েছে',
      });
      fetchData();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save user';
      // Try to extract more specific error message
      const displayMessage = errorMessage.includes('mill') || errorMessage.includes('Mill') 
        ? 'মিল নির্বাচন করা বাধ্যতামূলক'
        : errorMessage;
      setError(displayMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: displayMessage,
      });
    }
  };

  const handleEdit = async (user: User) => {
    // Refresh mills before opening edit dialog to get latest mills
    await fetchMills();
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      millId: user.millId?.toString() || '',
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setUserToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await usersAPI.delete(userToDelete);
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      toast({
        variant: 'success',
        title: 'সফল',
        description: 'ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে',
      });
      fetchData();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete user';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
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
          <h1 className="text-3xl font-bold text-gray-900">ব্যবহারকারী ব্যবস্থাপনা</h1>
          </div>
          <p className="text-gray-600 mt-2">ব্যবহারকারী তৈরি, সম্পাদনা এবং ব্যবস্থাপনা করুন</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={async (open) => {
          setIsDialogOpen(open);
          if (open) {
            // Refresh mills when dialog opens to get latest mills from database
            await fetchMills();
          } else {
            setError(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={async () => {
              setEditingUser(null);
              setError(null);
              // Refresh mills before opening dialog
              await fetchMills();
              setFormData({
                email: '',
                password: '',
                name: '',
                role: 'MILL_ADMIN',
                millId: '',
                isActive: true,
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              নতুন ব্যবহারকারী
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{editingUser ? 'ব্যবহারকারী সম্পাদনা' : 'নতুন ব্যবহারকারী তৈরি'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'ব্যবহারকারীর তথ্য আপডেট করুন' : 'একটি নতুন ব্যবহারকারী যোগ করুন'}
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
                    <Label htmlFor="email" className="text-sm font-medium">ইমেইল *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                      className="mt-1"
                  />
                </div>
                <div>
                    <Label htmlFor="password" className="text-sm font-medium">
                      {editingUser ? 'নতুন পাসওয়ার্ড (ঐচ্ছিক)' : 'পাসওয়ার্ড *'}
                    </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!editingUser}
                      className="mt-1"
                  />
                </div>
                <div>
                    <Label htmlFor="role" className="text-sm font-medium">ভূমিকা *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: 'SUPER_ADMIN' | 'MILL_ADMIN' | 'STAFF') =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                      <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MILL_ADMIN">মিল অ্যাডমিন</SelectItem>
                      <SelectItem value="STAFF">স্টাফ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role !== 'SUPER_ADMIN' && (
                    <div className="md:col-span-2">
                      <Label htmlFor="millId" className="text-sm font-medium">মিল *</Label>
                      {mills && mills.length > 0 ? (
                    <Select
                      value={formData.millId}
                          onValueChange={(value) => {
                            setFormData({ ...formData, millId: value });
                            setError(null);
                          }}
                          required
                    >
                          <SelectTrigger className="mt-1">
                        <SelectValue placeholder="মিল নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {mills.map((mill) => (
                          <SelectItem key={mill.id} value={mill.id.toString()}>
                            {mill.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                      ) : (
                        <div className="mt-1">
                          <div className="flex items-center gap-2 p-3 rounded-lg border-2 border-amber-200 bg-amber-50">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-amber-800">কোনো মিল পাওয়া যায়নি</p>
                              <p className="text-xs text-amber-700 mt-0.5">
                                প্রথমে একটি মিল তৈরি করুন অথবা{' '}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    console.log('Manual refresh clicked');
                                    await fetchMills();
                                  }}
                                  className="underline font-medium hover:text-amber-900"
                                >
                                  রিফ্রেশ করুন
                                </button>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )}
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
                        ব্যবহারকারী সক্রিয়
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
                <Button 
                  type="submit"
                  disabled={formData.role !== 'SUPER_ADMIN' && (!mills || mills.length === 0)}
                >
                  {editingUser ? 'আপডেট' : 'তৈরি করুন'}
                </Button>
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
              placeholder="ব্যবহারকারী খুঁজুন (নাম, ইমেইল, ভূমিকা)..."
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
                <TableHead className="font-semibold">ইমেইল</TableHead>
                <TableHead className="font-semibold">ভূমিকা</TableHead>
                <TableHead className="font-semibold">মিল</TableHead>
                <TableHead className="font-semibold">স্ট্যাটাস</TableHead>
                <TableHead className="font-semibold text-right">কার্যক্রম</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {!filteredUsers || filteredUsers.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-gray-500 font-medium">
                        {searchQuery ? 'কোনো ব্যবহারকারী পাওয়া যায়নি' : 'কোনো ব্যবহারকারী নেই'}
                      </p>
                      {!searchQuery && (
                        <p className="text-sm text-gray-400 mt-1">নতুন ব্যবহারকারী তৈরি করতে উপরের বাটন ব্যবহার করুন</p>
                      )}
                    </div>
                </TableCell>
              </TableRow>
            ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'MILL_ADMIN' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                        {user.role === 'SUPER_ADMIN' && <Shield className="h-3.5 w-3.5" />}
                        {user.role === 'MILL_ADMIN' && <UserCheck className="h-3.5 w-3.5" />}
                      {user.role === 'SUPER_ADMIN' ? 'সুপার অ্যাডমিন' :
                       user.role === 'MILL_ADMIN' ? 'মিল অ্যাডমিন' : 'স্টাফ'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {user.millId ? (
                        <span className="text-gray-700">
                          {mills?.find(m => m.id === user.millId)?.name || `ID: ${user.millId}`}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                  </TableCell>
                  <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            সক্রিয়
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3.5 w-3.5" />
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
                        onClick={() => handleEdit(user)}
                          className="hover:bg-blue-50 hover:border-blue-200"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                          onClick={() => handleDeleteClick(user.id)}
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
        {filteredUsers && filteredUsers.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
            মোট {filteredUsers.length} জন ব্যবহারকারী {searchQuery && `(${users.length} জনের মধ্যে)`}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ব্যবহারকারী মুছে ফেলা</DialogTitle>
            <DialogDescription>
              আপনি কি নিশ্চিত যে আপনি এই ব্যবহারকারীটি মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setUserToDelete(null);
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




