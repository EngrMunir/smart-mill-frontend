'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usersAPI, millsAPI, User, Mill } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User as UserIcon, Lock, Save, Building2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/toast-simple';
import { AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [mill, setMill] = useState<Mill | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching profile...');
      
      // Try to fetch from API first
      try {
        const profile = await usersAPI.getProfile();
        console.log('Fetched profile from API:', profile);
        if (profile && profile.id) {
          setUser(profile);
          
          // Fetch mill information if millId exists
          if (profile.millId) {
            try {
              const millData = await millsAPI.getById(profile.millId);
              setMill(millData);
            } catch (millErr) {
              console.warn('Failed to fetch mill:', millErr);
            }
          }
          return;
        }
      } catch (apiErr: any) {
        console.warn('API fetch failed, trying AuthContext:', apiErr);
        // If API fails, try to use current user from AuthContext
        if (currentUser && currentUser.id) {
          console.log('Using current user from AuthContext:', currentUser);
          setUser(currentUser);
          
          if (currentUser.millId) {
            try {
              const millData = await millsAPI.getById(currentUser.millId);
              setMill(millData);
            } catch (millErr) {
              console.warn('Failed to fetch mill:', millErr);
            }
          }
          return;
        }
        throw apiErr;
      }
      
      // If we reach here, both API and AuthContext failed
      throw new Error('Unable to load profile from API or AuthContext');
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      const errorMessage = err.message || 'Failed to load profile';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: `প্রোফাইল লোড করতে ব্যর্থ হয়েছে: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword.length < 6) {
      setError('নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      await usersAPI.update(user!.id, {
        password: formData.newPassword,
      });

      toast({
        variant: 'success',
        title: 'সফল',
        description: 'পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে',
      });

      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update password';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
    } finally {
      setSaving(false);
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

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">ব্যবহারকারী তথ্য লোড করতে ব্যর্থ হয়েছে</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <UserIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">প্রোফাইল</h1>
        </div>
        <p className="text-gray-600 mt-2">আপনার প্রোফাইল তথ্য দেখুন এবং আপডেট করুন</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>ব্যবহারকারী তথ্য</CardTitle>
            <CardDescription>আপনার ব্যক্তিগত তথ্য</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">নাম</Label>
              <p className="text-lg font-semibold mt-1">{user.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ইমেইল</Label>
              <p className="text-lg font-semibold mt-1">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">ভূমিকা</Label>
              <p className="text-lg font-semibold mt-1">
                {user.role === 'SUPER_ADMIN' ? 'সুপার অ্যাডমিন' :
                 user.role === 'MILL_ADMIN' ? 'মিল অ্যাডমিন' : 'স্টাফ'}
              </p>
            </div>
            {mill && (
              <div>
                <Label className="text-sm font-medium text-gray-500">মিল</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <p className="text-lg font-semibold">{mill.name}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{mill.address}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium text-gray-500">স্ট্যাটাস</Label>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mt-1 ${
                user.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">তৈরি করা হয়েছে</Label>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(user.createdAt).toLocaleDateString('bn-BD', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
            </div>
            <CardDescription>আপনার পাসওয়ার্ড আপডেট করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">বর্তমান পাসওয়ার্ড</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">নতুন পাসওয়ার্ড *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={6}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">কমপক্ষে ৬ অক্ষর</p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="mt-1"
                />
              </div>
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    সংরক্ষণ হচ্ছে...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    পাসওয়ার্ড আপডেট করুন
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

