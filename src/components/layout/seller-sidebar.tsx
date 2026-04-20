'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, MapPin, UtensilsCrossed, LogOut, Menu, X, Store } from 'lucide-react';
import { useLogout } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/lib/store/auth-store';

const navItems = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/seller/zones', label: 'Zones', icon: MapPin },
  { href: '/seller/menu', label: 'Menu', icon: UtensilsCrossed },
  { href: '/seller/profile', label: 'Shop Profile', icon: Store },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const logoutMutation = useLogout();
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 z-[200] flex items-center px-4 bg-white border-b border-orange-200 shadow-sm">
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((prev) => !prev); }}
          className="touch-manipulation select-none p-3 -m-2 rounded-lg bg-orange-500 text-white shadow min-h-[44px] min-w-[44px] flex items-center justify-center active:bg-orange-600 cursor-pointer"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5 shrink-0" /> : <Menu className="h-5 w-5 shrink-0" />}
        </button>
        <span className="ml-2 font-semibold text-gray-800">Seller Panel</span>
      </div>

      {/* Mobile overlay + sidebar */}
      <div className={cn('lg:hidden fixed inset-0 z-[150] pointer-events-none', open && 'pointer-events-auto')}>
        {open && (
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
        )}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 top-14 w-64 bg-white border-r border-orange-100 min-h-[calc(100vh-3.5rem)] flex flex-col transition-transform duration-300 ease-out',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ zIndex: 1 }}
        >
          <div className="p-5 border-b border-orange-100 bg-gradient-to-r from-orange-500 to-yellow-500 shrink-0">
            <Link href="/seller/dashboard" onClick={() => setOpen(false)}>
              <p className="text-xl font-bold text-white">🍔 GeoZakaz</p>
              <p className="text-orange-100 text-xs mt-0.5">Seller Dashboard</p>
            </Link>
          </div>
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
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[48px] font-medium',
                    isActive
                      ? 'bg-orange-50 text-orange-600 border border-orange-200'
                      : 'text-gray-600 hover:bg-orange-50/50 hover:text-orange-500'
                  )}
                >
                  <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-orange-500" : "text-gray-400")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-orange-100">
            <div className="mb-3 px-2">
              <p className="text-sm font-bold text-gray-900">{user?.name || 'Seller'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              className="w-full gap-2 border-red-200 text-red-500 hover:bg-red-50 min-h-[44px] justify-center"
              onClick={() => { logoutMutation.mutate(); setOpen(false); }}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:static inset-y-0 left-0 w-64 bg-white border-r border-orange-100 min-h-screen flex-col shrink-0 shadow-sm">
        <div className="p-5 border-b border-orange-100 bg-gradient-to-br from-orange-500 to-yellow-500 shrink-0">
          <Link href="/seller/dashboard">
            <p className="text-2xl font-black text-white tracking-tight">🍔 GeoZakaz</p>
            <p className="text-orange-100 text-xs font-medium uppercase tracking-wider mt-1 opacity-90">Seller Dashboard</p>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all min-h-[48px] font-semibold group',
                  isActive
                    ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                    : 'text-gray-500 hover:bg-orange-50/50 hover:text-orange-500'
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-colors", 
                  isActive ? "text-orange-600" : "text-gray-400 group-hover:text-orange-500"
                )} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-orange-100 bg-orange-50/10">
          <div className="mb-3 px-2">
            <p className="text-sm font-bold text-gray-900 line-clamp-1">{user?.name || 'Seller'}</p>
            <p className="text-xs text-gray-500 line-clamp-1 font-medium">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 min-h-[44px] justify-center transition-all shadow-sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="font-semibold">Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
