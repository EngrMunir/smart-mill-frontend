'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/toast-simple';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      // Redirect based on role
      if (loggedInUser.role === 'SUPER_ADMIN') {
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'সফলভাবে লগইন করা হয়েছে',
        });
        router.push('/super-admin/dashboard');
      } else if (loggedInUser.role === 'MILL_ADMIN') {
        toast({
          variant: 'success',
          title: 'সফল',
          description: 'সফলভাবে লগইন করা হয়েছে',
        });
        router.push('/mill-admin/dashboard');
      } else {
        // For STAFF or unknown roles, stay on login
        const errorMsg = 'আপনার এই সিস্টেমে অ্যাক্সেস নেই।';
        setError(errorMsg);
        toast({
          variant: 'destructive',
          title: 'ত্রুটি',
          description: errorMsg,
        });
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error?.message || 'লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে আপনার পরিচয়পত্র পরীক্ষা করুন।';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'ত্রুটি',
        description: errorMessage,
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-center text-2xl font-bold text-gray-900">
            আল হুদা অটো রাইস মিল
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            ব্যবস্থাপনা সিস্টেমে লগইন করুন
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">ইমেইল *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@example.com"
                disabled={loading}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">পাসওয়ার্ড *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••"
                disabled={loading}
                className="w-full"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  লগইন করা হচ্ছে...
                </>
              ) : (
                'লগইন করুন'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


