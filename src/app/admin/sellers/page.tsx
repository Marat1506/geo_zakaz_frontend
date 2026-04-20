'use client';

import { useState } from 'react';
import { useSellers, useCreateSeller, useBlockSeller, useUnblockSeller, useApproveSeller, useRejectSeller } from '@/lib/hooks/use-sellers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from '@/components/ui/toast';
import { Plus, ShieldOff, ShieldCheck, Users, Check, X, FileText, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';

interface CreateSellerFormData {
  email: string;
  name: string;
  password: string;
}

function DocImage({ url, label }: { url: string; label: string }) {
  const src = getImageUrl(url) || url;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <a href={src} target="_blank" rel="noopener noreferrer">
        <img src={src} alt={label} className="h-32 w-full object-cover rounded-lg border hover:opacity-90 transition-opacity cursor-pointer" />
      </a>
    </div>
  );
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
  const [expandedDocs, setExpandedDocs] = useState<string | null>(null);

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
      const message = (err as any)?.response?.data?.message || 'Failed to create seller.';
      setFormError(message);
    }
  };

  const handleBlock = async (id: string) => {
    try {
      await blockSeller.mutateAsync(id);
      toast({ title: 'Seller blocked' });
    } catch {
      toast({ title: 'Error', description: 'Failed to block seller.', variant: 'destructive' });
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockSeller.mutateAsync(id);
      toast({ title: 'Seller unblocked' });
    } catch {
      toast({ title: 'Error', description: 'Failed to unblock seller.', variant: 'destructive' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveSeller.mutateAsync(id);
      toast({ title: 'Seller approved', description: 'Registration request approved.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to approve seller.', variant: 'destructive' });
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this registration request?')) return;
    try {
      await rejectSeller.mutateAsync(id);
      toast({ title: 'Seller rejected' });
    } catch {
      toast({ title: 'Error', description: 'Failed to reject seller.', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-[50vh]"><LoadingSpinner /></div>;

  const pendingSellers = (sellers || []).filter((s: any) => s.status === 'pending');
  const otherSellers = (sellers || []).filter((s: any) => s.status !== 'pending');

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
            <p className="text-sm text-gray-500">
              {sellers?.length ?? 0} registered
              {pendingSellers.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {pendingSellers.length} pending review
                </span>
              )}
            </p>
          </div>
        </div>
        <Button onClick={() => { setShowForm(v => !v); setFormError(null); }}
          className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />
          Create Seller
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <Card className="border-2 border-orange-200 bg-orange-50/60">
          <CardHeader><CardTitle className="text-lg text-orange-800">New Seller</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['name', 'email', 'password'] as const).map(field => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 capitalize">{field}</label>
                    <input
                      type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                      placeholder={field === 'email' ? 'seller@example.com' : field === 'name' ? 'Full name' : 'Password'}
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                    />
                  </div>
                ))}
              </div>
              {formError && <p className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-3">
                <Button type="submit" disabled={createSeller.isPending} className="bg-orange-500 hover:bg-orange-600 text-white min-h-[40px]">
                  {createSeller.isPending ? 'Creating…' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setFormError(null); }} className="min-h-[40px]">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Pending sellers — highlighted section */}
      {pendingSellers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-yellow-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pending Review ({pendingSellers.length})
          </h2>
          {pendingSellers.map((seller: any) => (
            <SellerCard
              key={seller.id}
              seller={seller}
              expandedDocs={expandedDocs}
              setExpandedDocs={setExpandedDocs}
              onApprove={handleApprove}
              onReject={handleReject}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              approvePending={approveSeller.isPending}
              rejectPending={rejectSeller.isPending}
              blockPending={blockSeller.isPending}
              unblockPending={unblockSeller.isPending}
            />
          ))}
        </div>
      )}

      {/* All other sellers */}
      <Card>
        <CardContent className="p-0">
          {otherSellers.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No approved/rejected sellers yet.</div>
          ) : (
            <div className="divide-y">
              {otherSellers.map((seller: any) => (
                <SellerCard
                  key={seller.id}
                  seller={seller}
                  expandedDocs={expandedDocs}
                  setExpandedDocs={setExpandedDocs}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onBlock={handleBlock}
                  onUnblock={handleUnblock}
                  approvePending={approveSeller.isPending}
                  rejectPending={rejectSeller.isPending}
                  blockPending={blockSeller.isPending}
                  unblockPending={unblockSeller.isPending}
                  flat
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SellerCard({
  seller, expandedDocs, setExpandedDocs,
  onApprove, onReject, onBlock, onUnblock,
  approvePending, rejectPending, blockPending, unblockPending,
  flat,
}: any) {
  const hasDocs = seller.passportMainUrl || seller.passportRegistrationUrl || seller.selfieUrl;
  const isExpanded = expandedDocs === seller.id;

  const statusBadge = seller.status === 'pending'
    ? 'bg-yellow-100 text-yellow-700'
    : seller.status === 'rejected' || seller.isBlocked
      ? 'bg-red-100 text-red-700'
      : 'bg-green-100 text-green-700';

  const statusLabel = seller.status === 'pending' ? 'Pending'
    : seller.status === 'rejected' ? 'Rejected'
      : seller.isBlocked ? 'Blocked' : 'Active';

  const content = (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">{seller.name || <span className="text-gray-400 italic">—</span>}</p>
          <p className="text-sm text-gray-500">{seller.email}</p>
          {seller.phone && <p className="text-xs text-gray-400">{seller.phone}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${statusBadge} text-xs`}>{statusLabel}</Badge>

          {hasDocs && (
            <Button size="sm" variant="outline" className="gap-1.5 min-h-[36px] text-xs"
              onClick={() => setExpandedDocs(isExpanded ? null : seller.id)}>
              <Eye className="h-3.5 w-3.5" />
              Documents
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          )}

          {seller.status === 'pending' && (
            <>
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 min-h-[36px] gap-1.5"
                onClick={() => onApprove(seller.id)} disabled={approvePending}>
                <Check className="h-3.5 w-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 min-h-[36px] gap-1.5"
                onClick={() => onReject(seller.id)} disabled={rejectPending}>
                <X className="h-3.5 w-3.5" /> Reject
              </Button>
            </>
          )}

          {seller.status === 'approved' && (
            seller.isBlocked ? (
              <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50 min-h-[36px] gap-1.5"
                onClick={() => onUnblock(seller.id)} disabled={unblockPending}>
                <ShieldCheck className="h-3.5 w-3.5" /> Unblock
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 min-h-[36px] gap-1.5"
                onClick={() => onBlock(seller.id)} disabled={blockPending}>
                <ShieldOff className="h-3.5 w-3.5" /> Block
              </Button>
            )
          )}

          {seller.status === 'rejected' && (
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 min-h-[36px] gap-1.5"
              onClick={() => onApprove(seller.id)} disabled={approvePending}>
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
          )}
        </div>
      </div>

      {/* Documents panel */}
      {isExpanded && hasDocs && (
        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {seller.passportMainUrl && <DocImage url={seller.passportMainUrl} label="Passport — Main Page" />}
          {seller.passportRegistrationUrl && <DocImage url={seller.passportRegistrationUrl} label="Passport — Registration" />}
          {seller.selfieUrl && <DocImage url={seller.selfieUrl} label="Selfie with Passport" />}
        </div>
      )}
    </div>
  );

  if (flat) return content;

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50/30">
      {content}
    </Card>
  );
}
