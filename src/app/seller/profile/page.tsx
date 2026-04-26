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

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const downloadBusinessCardAsImage = async (
    format: 'png' | 'jpeg',
    preset: 'card' | 'a4' = 'card',
  ) => {
    try {
      const qrResponse = await apiClient.get<{ qrCode: string; referralUrl: string }>('/auth/seller/qr-code');
      const qrImg = await loadImage(qrResponse.data.qrCode);
      const logoSrc = getImageUrl(profile.shopLogo) || '';
      const logoImg = logoSrc ? await loadImage(logoSrc).catch(() => null) : null;

      const width = preset === 'a4' ? 2480 : 1200;
      const height = preset === 'a4' ? 3508 : 1700;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // Background
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, width, height);

      // Card
      const cardX = preset === 'a4' ? 140 : 100;
      const cardY = preset === 'a4' ? 140 : 80;
      const cardW = width - cardX * 2;
      const cardH = height - cardY * 2;
      const radius = 24;
      ctx.beginPath();
      ctx.moveTo(cardX + radius, cardY);
      ctx.lineTo(cardX + cardW - radius, cardY);
      ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
      ctx.lineTo(cardX + cardW, cardY + cardH - radius);
      ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
      ctx.lineTo(cardX + radius, cardY + cardH);
      ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
      ctx.lineTo(cardX, cardY + radius);
      ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Logo
      const centerX = width / 2;
      if (logoImg) {
        const logoSize = preset === 'a4' ? 280 : 170;
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, preset === 'a4' ? 420 : 235, logoSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          logoImg,
          centerX - logoSize / 2,
          preset === 'a4' ? 280 : 150,
          logoSize,
          logoSize,
        );
        ctx.restore();
      }

      // Shop name and owner
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff8c00';
      ctx.font = preset === 'a4' ? 'bold 86px Arial' : 'bold 56px Arial';
      ctx.fillText(profile.shopName || 'Shop', centerX, preset === 'a4' ? 660 : 380);

      ctx.fillStyle = '#666666';
      ctx.font = preset === 'a4' ? '42px Arial' : '28px Arial';
      ctx.fillText(
        profile.contactEmail ? profile.contactEmail.split('@')[0] : 'Seller',
        centerX,
        preset === 'a4' ? 730 : 425,
      );

      if (profile.shopDescription) {
        ctx.fillStyle = '#444444';
        ctx.font = preset === 'a4' ? '36px Arial' : '24px Arial';
        ctx.fillText(
          profile.shopDescription.slice(0, preset === 'a4' ? 90 : 70),
          centerX,
          preset === 'a4' ? 820 : 480,
        );
      }

      // Contact box
      ctx.fillStyle = '#fff5e6';
      const contactX = preset === 'a4' ? 360 : 220;
      const contactY = preset === 'a4' ? 920 : 530;
      const contactW = width - contactX * 2;
      const contactH = preset === 'a4' ? 280 : 170;
      ctx.fillRect(contactX, contactY, contactW, contactH);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#333333';
      ctx.font = preset === 'a4' ? '40px Arial' : '28px Arial';
      if (profile.contactPhone) {
        ctx.fillText(`Phone: ${profile.contactPhone}`, contactX + 30, contactY + (preset === 'a4' ? 105 : 65));
      }
      if (profile.contactEmail) {
        ctx.fillText(`Email: ${profile.contactEmail}`, contactX + 30, contactY + (preset === 'a4' ? 190 : 115));
      }

      // Separator
      ctx.strokeStyle = '#ff8c00';
      ctx.setLineDash([12, 10]);
      ctx.lineWidth = 3;
      ctx.beginPath();
      const sepY = preset === 'a4' ? 1280 : 760;
      const sepPad = preset === 'a4' ? 360 : 220;
      ctx.moveTo(sepPad, sepY);
      ctx.lineTo(width - sepPad, sepY);
      ctx.stroke();
      ctx.setLineDash([]);

      // QR title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff8c00';
      ctx.font = preset === 'a4' ? 'bold 62px Arial' : 'bold 40px Arial';
      ctx.fillText('Scan to order', centerX, preset === 'a4' ? 1400 : 840);

      // QR frame + image
      const qrSize = preset === 'a4' ? 680 : 360;
      const qrX = centerX - qrSize / 2;
      const qrY = preset === 'a4' ? 1480 : 880;
      ctx.fillStyle = '#ffffff';
      const framePad = preset === 'a4' ? 30 : 20;
      ctx.fillRect(qrX - framePad, qrY - framePad, qrSize + framePad * 2, qrSize + framePad * 2);
      ctx.strokeStyle = '#ff8c00';
      ctx.lineWidth = preset === 'a4' ? 8 : 6;
      ctx.strokeRect(qrX - framePad, qrY - framePad, qrSize + framePad * 2, qrSize + framePad * 2);
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = '#666666';
      ctx.font = preset === 'a4' ? '34px Arial' : '22px Arial';
      ctx.fillText(
        'Point your camera to this QR code',
        centerX,
        qrY + qrSize + (preset === 'a4' ? 110 : 70),
      );

      const mime = format === 'png' ? 'image/png' : 'image/jpeg';
      const quality = format === 'png' ? 1 : 0.92;
      const dataUrl = canvas.toDataURL(mime, quality);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = preset === 'a4' ? `business-card-a4.${format}` : `business-card.${format}`;
      a.click();
      toast({
        title:
          preset === 'a4'
            ? `Business card A4 downloaded as ${format.toUpperCase()}!`
            : `Business card downloaded as ${format.toUpperCase()}!`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to generate image business card',
        variant: 'destructive',
      });
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
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => downloadBusinessCardAsImage('png')}
                  variant="outline"
                  className="w-full sm:flex-1"
                >
                  Download as PNG
                </Button>
                <Button
                  onClick={() => downloadBusinessCardAsImage('jpeg')}
                  variant="outline"
                  className="w-full sm:flex-1"
                >
                  Download as JPEG
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => downloadBusinessCardAsImage('png', 'a4')}
                  variant="outline"
                  className="w-full sm:flex-1"
                >
                  Download A4 (PNG)
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
