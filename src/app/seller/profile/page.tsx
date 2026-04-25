'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Store, QrCode, Copy, Check, ImageIcon, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { toast } from '@/components/ui/toast';
import { useUploadImage } from '@/lib/hooks/use-menu';
import { getImageUrl } from '@/lib/utils/image';

export default function SellerProfilePage() {
  const uploadImage = useUploadImage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    shopName: '',
    shopDescription: '',
    shopLogo: '',
    contactPhone: '',
    contactEmail: '',
    contactAddress: '',
    slug: '',
    referralCode: '',
    referralVisits: 0,
    referralOrders: 0,
  });
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedSlug, setSavedSlug] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await apiClient.get('/auth/seller/profile');
      setProfile(response.data);
      setSavedSlug(response.data?.slug || '');
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShopLogoFile = async (file: File | null) => {
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      setProfile((p) => ({ ...p, shopLogo: url }));
      toast({ title: 'Logo uploaded — save profile to apply' });
    } catch {
      toast({ title: 'Error', description: 'Failed to upload image', variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await apiClient.patch('/auth/seller/profile', {
        shopName: profile.shopName,
        shopDescription: profile.shopDescription,
        shopLogo: profile.shopLogo,
        contactPhone: profile.contactPhone,
        contactEmail: profile.contactEmail,
        contactAddress: profile.contactAddress,
        slug: profile.slug,
      });
      setSavedSlug(response.data?.slug || profile.slug || '');
      toast({ title: 'Profile updated successfully!' });
      loadProfile();
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update profile', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const loadQRCode = async () => {
    try {
      const response = await apiClient.get<{ qrCode: string }>('/auth/seller/qr-code');
      setQrCode(response.data.qrCode);
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to generate QR code', variant: 'destructive' });
    }
  };

  const downloadBusinessCard = async () => {
    try {
      const response = await apiClient.get<{ html: string }>('/auth/seller/business-card');

      const blob = new Blob([response.data.html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'business-card.html';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Business card downloaded!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to generate business card', variant: 'destructive' });
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/ref/${savedSlug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: 'Referral link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  const logoPreview = getImageUrl(profile.shopLogo);

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto overflow-x-hidden">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Store className="h-8 w-8 text-orange-500" />
          Shop Profile
        </h1>
        <p className="text-gray-600 mt-2">Manage your shop information and referral settings</p>
      </div>

      <div className="grid gap-6 w-full max-w-3xl mx-auto">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Shop logo</Label>
              <p className="text-sm text-gray-500 mt-1 mb-2">Shown on your referral page and on the downloadable business card</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4 mt-2">
                <div className="relative h-24 w-24 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Shop logo" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="w-full sm:w-auto">
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="w-full sm:max-w-xs cursor-pointer"
                    disabled={uploadImage.isPending}
                    onChange={(e) => handleShopLogoFile(e.target.files?.[0] ?? null)}
                  />
                  {profile.shopLogo ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-red-600"
                      onClick={() => setProfile((p) => ({ ...p, shopLogo: '' }))}
                    >
                      Remove logo
                    </Button>
                  ) : null}
                </div>
                {uploadImage.isPending ? <Loader2 className="h-5 w-5 animate-spin text-orange-500" /> : null}
              </div>
            </div>

            <div>
              <Label htmlFor="shopName">Shop Name *</Label>
              <Input
                id="shopName"
                value={profile.shopName}
                onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                placeholder="My Awesome Shop"
              />
            </div>

            <div>
              <Label htmlFor="shopDescription">Shop Description</Label>
              <textarea
                id="shopDescription"
                value={profile.shopDescription}
                onChange={(e) => setProfile({ ...profile, shopDescription: e.target.value })}
                placeholder="Tell customers about your shop..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              />
            </div>

            <div>
              <Label htmlFor="slug">Referral Slug * (for /ref/your-slug)</Label>
              <Input
                id="slug"
                value={profile.slug}
                onChange={(e) => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                placeholder="my-shop"
              />
              <p className="text-sm text-gray-500 mt-1">
                Only lowercase letters, numbers, and hyphens allowed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                value={profile.contactPhone}
                onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={profile.contactEmail}
                onChange={(e) => setProfile({ ...profile, contactEmail: e.target.value })}
                placeholder="shop@example.com"
              />
            </div>

            <div>
              <Label htmlFor="contactAddress">Address</Label>
              <textarea
                id="contactAddress"
                value={profile.contactAddress}
                onChange={(e) => setProfile({ ...profile, contactAddress: e.target.value })}
                placeholder="123 Main St, City, Country"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        {savedSlug && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Referral & QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{profile.referralVisits}</div>
                  <div className="text-sm text-gray-600">Total Visits</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{profile.referralOrders}</div>
                  <div className="text-sm text-gray-600">Orders via Referral</div>
                </div>
              </div>

              <div>
                <Label>Your Referral Link</Label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <Input
                    value={`${window.location.origin}/ref/${savedSlug}`}
                    readOnly
                    className="flex-1 min-w-0 w-full"
                  />
                  <Button onClick={copyReferralLink} variant="outline" className="w-full sm:w-auto">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={loadQRCode} variant="outline" className="w-full sm:flex-1">
                  Generate QR Code
                </Button>
                <Button onClick={downloadBusinessCard} variant="outline" className="w-full sm:flex-1">
                  Download Business Card
                </Button>
              </div>

              {qrCode && (
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <img src={qrCode} alt="QR Code" className="mx-auto" />
                  <p className="text-sm text-gray-600 mt-2">Scan to visit your shop</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
