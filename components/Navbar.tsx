'use client';

import { Bell, Search, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Determine profile link based on user role
  const profileLink = pathname?.startsWith('/super-admin') 
    ? '/super-admin/profile' 
    : '/mill-admin/profile';

  const roleLabel = user?.role === 'SUPER_ADMIN' 
    ? 'সুপার অ্যাডমিন' 
    : user?.role === 'MILL_ADMIN' 
    ? 'মিল অ্যাডমিন' 
    : 'স্টাফ';

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-0 lg:left-64 z-30">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <Link 
          href={profileLink}
          className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">
              {user?.name || 'ব্যবহারকারী'}
            </span>
            <span className="text-xs text-gray-500">
              {roleLabel}
            </span>
          </div>
        </Link>
      </div>
    </nav>
  );
}





