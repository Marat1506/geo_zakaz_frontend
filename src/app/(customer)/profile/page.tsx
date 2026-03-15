'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useOrders } from '@/lib/hooks/use-orders';
import { useLogout } from '@/lib/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  User, Package, Clock, CheckCircle, Truck, Mail, Phone,
  LogOut, ChevronRight, RefreshCw, XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

const statusConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  pending_payment: { label: 'Awaiting payment', icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-100' },
  preparing: { label: 'Preparing', icon: Package, color: 'text-orange-700', bg: 'bg-orange-100' },
  on_the_way: { label: 'On the way', icon: Truck, color: 'text-blue-700', bg: 'bg-blue-100' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-700', bg: 'bg-red-100' },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const logoutMutation = useLogout();
  const { data: orders, isLoading, refetch, isFetching } = useOrders();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const activeOrders = orders?.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ) || [];

  const pastOrders = orders?.filter(
    (o) => o.status === 'delivered' || o.status === 'cancelled'
  ) || [];

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const { data } = await apiClient.patch('/auth/profile', form);
      updateUser(data);
      setEditMode(false);
    } catch {
      setSaveError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-6 px-4">
      <div className="container mx-auto max-w-5xl space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-orange-600">Profile</h1>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="border-red-400 text-red-500 hover:bg-red-50 min-h-[44px]"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — profile */}
          <div className="space-y-4">
            <Card className="shadow-lg border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-t-lg pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-full bg-white/30 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{user.name || 'Customer'}</p>
                    <p className="text-orange-100 text-sm">{user.email}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {!editMode ? (
                  <>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-sm truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="h-4 w-4 text-orange-400 flex-shrink-0" />
                        <span className="text-sm">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-700">
                      <Package className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-sm">Orders: {orders?.length || 0}</span>
                    </div>
                    <Button
                      onClick={() => { setForm({ name: user.name || '', phone: user.phone || '' }); setEditMode(true); }}
                      variant="outline"
                      className="w-full mt-2 border-orange-300 text-orange-600 hover:bg-orange-50 min-h-[44px]"
                    >
                      Edit profile
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-600">Name</Label>
                      <Input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="mt-1 h-11 border-orange-300"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600">Phone</Label>
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-1 h-11 border-orange-300"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    {saveError && <p className="text-sm text-red-500">{saveError}</p>}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 min-h-[44px]"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        onClick={() => setEditMode(false)}
                        variant="outline"
                        className="flex-1 min-h-[44px]"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Quick links */}
            <Card className="shadow-lg border-2 border-orange-200">
              <CardContent className="pt-4 space-y-2">
                <Link href="/menu">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                    <span className="font-medium text-gray-700">Menu</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
                <Link href="/cart">
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors">
                    <span className="font-medium text-gray-700">Cart</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right column — orders */}
          <div className="lg:col-span-2 space-y-6">

            {/* Active orders */}
            <Card className="shadow-lg border-2 border-orange-200">
              <CardHeader className="bg-gradient-to-r from-orange-400 to-yellow-400 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">Active orders</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : activeOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">You have no active orders</p>
                    <Link href="/menu">
                      <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 min-h-[44px]">
                        Go to menu
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeOrders.map((order) => {
                      const s = statusConfig[order.status] || statusConfig.preparing;
                      const Icon = s.icon;
                      return (
                        <div key={order.id} className="p-4 bg-white border-2 border-orange-100 rounded-xl shadow-sm">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-bold text-gray-800">Order #{order.orderNumber}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(order.createdAt).toLocaleString()}
                              </p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
                              <Icon className="h-3 w-3" />
                              {s.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{order.items.length} items • {Number(order.totalAmount).toFixed(0)} ₽</p>
                            {order.estimatedTime && (
                              <p className="text-orange-600 font-medium">⏱ ~{order.estimatedTime} min</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order history */}
            <Card className="shadow-lg border-2 border-gray-200">
              <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-t-lg">
                <CardTitle className="text-white text-lg">Order history</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : pastOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-6">You have no past orders yet</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                    {pastOrders.map((order) => {
                      const s = statusConfig[order.status] || statusConfig.delivered;
                      const Icon = s.icon;
                      return (
                        <div key={order.id} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-700 text-sm">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items • {Number(order.totalAmount).toFixed(0)} ₽
                            </p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
                            <Icon className="h-3 w-3" />
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
