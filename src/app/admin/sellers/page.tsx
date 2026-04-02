'use client';

import { useState } from 'react';
import { useSellers, useCreateSeller, useBlockSeller, useUnblockSeller, useApproveSeller, useRejectSeller } from '@/lib/hooks/use-sellers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/components/ui/toast';
import { Plus, ShieldOff, ShieldCheck, Users, Check, X } from 'lucide-react';

interface CreateSellerFormData {
  email: string;
  name: string;
  password: string;
}

export default function SellersPage() {
  const { data: sellers, isLoading } = useSellers();
  const createSeller = useCreateSeller();
  const blockSeller = useBlockSeller();
  const unblockSeller = useUnblockSeller();
  const approveSeller = useApproveSeller();
  const rejectSeller = useRejectSeller();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateSellerFormData>({ email: '', name: '', password: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.email || !form.name || !form.password) {
      setFormError('All fields are required.');
      return;
    }

    try {
      await createSeller.mutateAsync(form);
      toast({ title: 'Success', description: 'Seller created successfully.' });
      setForm({ email: '', name: '', password: '' });
      setShowForm(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create seller.';
      setFormError(message);
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await blockSeller.mutateAsync(id);
      toast({ title: 'Seller blocked', description: 'The seller has been blocked.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to block seller.', variant: 'destructive' });
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockSeller.mutateAsync(id);
      toast({ title: 'Seller unblocked', description: 'The seller has been unblocked.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to unblock seller.', variant: 'destructive' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveSeller.mutateAsync(id);
      toast({ title: 'Seller approved', description: 'The registration request has been approved.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to approve seller.', variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this registration request?')) return;
    try {
      await rejectSeller.mutateAsync(id);
      toast({ title: 'Seller rejected', description: 'The registration request has been rejected.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reject seller.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
            <p className="text-sm text-gray-500">{sellers?.length ?? 0} registered</p>
          </div>
        </div>
        <Button
          onClick={() => { setShowForm((v) => !v); setFormError(null); }}
          className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Seller
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-2 border-orange-200 bg-orange-50/60">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">New Seller</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="seller@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                  />
                </div>
              </div>

              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createSeller.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white min-h-[40px]"
                >
                  {createSeller.isPending ? 'Creating…' : 'Create'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setFormError(null); }}
                  className="min-h-[40px]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Sellers table */}
      <Card>
        <CardContent className="p-0">
          {!sellers || sellers.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              No sellers yet. Create one to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-orange-50/60">
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Name</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-700">Status</th>
                    <th className="text-right px-4 py-3 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="border-b last:border-0 hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {seller.name || <span className="text-gray-400 italic">—</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{seller.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={seller.isBlocked || seller.status === 'rejected' ? 'secondary' : 'default'}
                            className={
                              seller.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                : seller.status === 'rejected' || seller.isBlocked
                                  ? 'bg-red-100 text-red-700 border-red-200'
                                  : 'bg-green-100 text-green-700 border-green-200'
                            }
                          >
                            {seller.status === 'pending' ? 'Pending' :
                              seller.status === 'rejected' ? 'Rejected' :
                                seller.isBlocked ? 'Blocked' : 'Active'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          {seller.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-300 text-green-700 hover:bg-green-50 min-h-[36px] gap-1.5"
                                onClick={() => handleApprove(seller.id)}
                                disabled={approveSeller.isPending}
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 min-h-[36px] gap-1.5"
                                onClick={() => handleReject(seller.id)}
                                disabled={rejectSeller.isPending}
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </>
                          )}

                          {seller.status === 'approved' && (
                            seller.isBlocked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-green-300 text-green-700 hover:bg-green-50 min-h-[36px] gap-1.5"
                                onClick={() => handleUnblock(seller.id)}
                                disabled={unblockSeller.isPending}
                              >
                                <ShieldCheck className="h-3.5 w-3.5" />
                                Unblock
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50 min-h-[36px] gap-1.5"
                                onClick={() => handleBlock(seller.id)}
                                disabled={blockSeller.isPending}
                              >
                                <ShieldOff className="h-3.5 w-3.5" />
                                Block
                              </Button>
                            )
                          )}

                          {seller.status === 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50 min-h-[36px] gap-1.5"
                              onClick={() => handleApprove(seller.id)}
                              disabled={approveSeller.isPending}
                            >
                              <Check className="h-3.5 w-3.5" />
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
