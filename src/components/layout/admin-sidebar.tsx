'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, MapPin, UtensilsCrossed, LogOut, Menu, X } from 'lucide-react';
import { useLogout } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/lib/store/auth-store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/menu-management', label: 'Menu', icon: UtensilsCrossed },
  { href: '/zones', label: 'Service Zones', icon: MapPin },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Мобильная кнопка */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-500 text-white rounded-lg shadow-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {open && <div className="lg:hidden fixed inset-0 bg-black/50 z-30" onClick={() => setOpen(false)} />}

      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Логотип */}
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-yellow-500">
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            <p className="text-xl font-bold text-white">🍔 GeoZakaz</p>
            <p className="text-orange-100 text-xs mt-0.5">Admin Panel</p>
          </Link>
        </div>

        {/* Навигация */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors min-h-[48px] font-medium',
                  isActive
                    ? 'bg-orange-50 text-orange-600 border border-orange-200'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Пользователь */}
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 border-red-200 text-red-500 hover:bg-red-50 min-h-[44px]"            onClick={() => { logoutMutation.mutate(); setOpen(false); }}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
