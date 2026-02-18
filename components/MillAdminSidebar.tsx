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
  LogOut,
  Warehouse,
  User,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MILL_INFO } from '@/lib/constants';

const menuItems = [
  { href: '/mill-admin/dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
  { href: '/mill-admin/customers', label: 'গ্রাহক', icon: Users },
  { 
    href: '/mill-admin/paddy', 
    label: 'ধান', 
    icon: Package,
    submenu: [
      { href: '/mill-admin/paddy/types', label: 'ধান প্রকার' },
      { href: '/mill-admin/paddy/rice-types', label: 'চাল প্রকার' },
      { href: '/mill-admin/paddy/bran-types', label: 'ভুসি প্রকার' },
      { href: '/mill-admin/farmers', label: 'ধান কেনা' },
    ]
  },
  { href: '/mill-admin/production', label: 'উৎপাদন', icon: Package },
  { href: '/mill-admin/sales/rice', label: 'বিক্রয়', icon: ShoppingCart },
  { href: '/mill-admin/external-purchase', label: 'বাইরের কেনা', icon: Package },
  { href: '/mill-admin/employees', label: 'কর্মচারী', icon: UserCheck },
  { href: '/mill-admin/payments', label: 'পেমেন্ট', icon: CreditCard },
  { href: '/mill-admin/stock', label: 'স্টক', icon: Warehouse },
  { href: '/mill-admin/reports', label: 'রিপোর্ট', icon: FileText },
];

export default function MillAdminSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSubmenu = (href: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

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
          {user && (
            <p className="text-xs text-gray-500 mt-2">লগইন: {user.name}</p>
          )}
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            const isSubmenuOpen = openSubmenus[item.href] || false;
            const isActive = pathname === item.href || 
              (item.href !== '/mill-admin/dashboard' && pathname.startsWith(item.href)) ||
              (hasSubmenu && item.submenu?.some(sub => pathname.startsWith(sub.href)));
            
            if (hasSubmenu) {
              return (
                <div key={item.href}>
                  <button
                    onClick={() => toggleSubmenu(item.href)}
                    className={`w-full flex items-center justify-between px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                      isActive ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon size={20} className="mr-3" />
                      <span>{item.label}</span>
                    </div>
                    {isSubmenuOpen ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>
                  {isSubmenuOpen && (
                    <div className="bg-gray-800">
                      {item.submenu?.map((subItem) => {
                        const isSubActive = pathname.startsWith(subItem.href);
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center px-6 py-2 pl-12 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors ${
                              isSubActive ? 'bg-gray-700 text-white' : ''
                            }`}
                          >
                            <span className="text-sm">{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
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

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span>লগআউট</span>
          </button>
        </div>
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








