'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login
        if (pathname !== '/login') {
          router.push('/login');
        }
      } else {
        // User is logged in, check if they're on the right route
        const isSuperAdminRoute = pathname.startsWith('/super-admin');
        const isMillAdminRoute = pathname.startsWith('/mill-admin');
        const isLoginRoute = pathname === '/login';

        if (isLoginRoute) {
          // Already logged in, redirect to appropriate dashboard
          if (user.role === 'SUPER_ADMIN') {
            router.push('/super-admin/dashboard');
          } else if (user.role === 'MILL_ADMIN') {
            router.push('/mill-admin/dashboard');
          }
        } else if (user.role === 'SUPER_ADMIN' && !isSuperAdminRoute) {
          // SUPER_ADMIN trying to access non-super-admin route
          router.push('/super-admin/dashboard');
        } else if (user.role === 'MILL_ADMIN' && !isMillAdminRoute) {
          // MILL_ADMIN trying to access non-mill-admin route
          router.push('/mill-admin/dashboard');
        } else if (user.role === 'STAFF') {
          // STAFF should not access admin routes
          router.push('/login');
        }
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!user && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
};


