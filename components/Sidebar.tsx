'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  UserCheck,
  FileText,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { MILL_INFO } from '@/lib/constants';

const menuItems = [
  { href: '/', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/farmers', label: 'কৃষক ও ধান কেনা', icon: Users },
  { href: '/production', label: 'উৎপাদন', icon: Package },
  { href: '/external-purchase', label: 'বাইরের কেনা', icon: Package },
  { href: '/sales/rice', label: 'চাল বিক্রি', icon: ShoppingCart },
  { href: '/sales/bran', label: 'ভুসি বিক্রি', icon: ShoppingCart },
  { href: '/dues', label: 'বাকি হিসাব', icon: CreditCard },
  { href: '/employees', label: 'কর্মচারী', icon: UserCheck },
  { href: '/reports', label: 'রিপোর্ট', icon: FileText },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 z-40 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-white leading-tight">{MILL_INFO.name}</h1>
          <p className="text-xs text-gray-400 mt-2">{MILL_INFO.address}</p>
          <p className="text-xs text-gray-400 mt-1">📱 {MILL_INFO.mobile}</p>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : ''
                }`}
              >
                <Icon size={20} className="mr-3" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}

