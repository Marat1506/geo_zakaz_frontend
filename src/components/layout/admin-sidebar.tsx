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
      {/* Mobile: top bar — above everything so hamburger is always clickable */}
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
        <span className="ml-2 font-semibold text-gray-800">Admin</span>
      </div>

      {/* Overlay and sidebar in same layer so sidebar draws on top of overlay */}
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
            'fixed inset-y-0 left-0 top-14 w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-3.5rem)] flex flex-col transition-transform duration-300 ease-out',
            open ? 'translate-x-0' : '-translate-x-full'
          )}
          style={{ zIndex: 1 }}
        >
          {/* Logo */}
          <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-yellow-500 shrink-0">
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            <p className="text-xl font-bold text-white">🍔 GeoZakaz</p>
            <p className="text-orange-100 text-xs mt-0.5">Admin Panel</p>
          </Link>
        </div>

          {/* Navigation */}
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

          {/* User */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-3 px-2">
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Administrator'}</p>
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

      {/* Desktop sidebar (always visible, not fixed overlay layer) */}
      <aside className={cn(
        'hidden lg:flex lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 min-h-screen flex-col shrink-0',
        'flex-col'
      )}>
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-yellow-500 shrink-0">
          <Link href="/dashboard">
            <p className="text-xl font-bold text-white">🍔 GeoZakaz</p>
            <p className="text-orange-100 text-xs mt-0.5">Admin Panel</p>
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
        <div className="p-4 border-t border-gray-200">
          <div className="mb-3 px-2">
            <p className="text-sm font-semibold text-gray-800">{user?.name || 'Administrator'}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 border-red-200 text-red-500 hover:bg-red-50 min-h-[44px] justify-center"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
