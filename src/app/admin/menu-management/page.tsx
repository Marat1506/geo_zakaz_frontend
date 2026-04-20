'use client';

import { useState } from 'react';
import { useMenu, useDeleteMenuItem } from '@/lib/hooks/use-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MenuItemForm } from '@/components/features/menu-item-form';
import { MenuItem } from '@/types/menu';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { getImageUrl } from '@/lib/utils/image';
import { useSellers } from '@/lib/hooks/use-sellers';
import { usePublicZones } from '@/lib/hooks/use-seller';

export default function MenuManagementPage() {
  const { data: categories, isLoading } = useMenu();
  const deleteMenuItem = useDeleteMenuItem();
  const { addToast } = useToast();
  const { data: sellers = [] } = useSellers();
  const { data: zones = [] } = usePublicZones();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const allMenuItems = categories?.flatMap((cat) => cat.items) || [];
  const sellersById = new Map((sellers as any[]).map((seller) => [seller.id, seller.name || seller.email]));
  const zoneSellerByZoneId = new Map((zones as any[]).map((zone) => [zone.id, zone.sellerId]));

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await deleteMenuItem.mutateAsync(id);
      addToast({
        title: 'Success',
        description: 'Menu item deleted successfully',
        variant: 'success',
      });
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your restaurant menu items
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allMenuItems.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <Badge variant={item.available ? 'default' : 'secondary'}>
                  {item.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {item.imageUrl && (
                <div className="relative h-32 w-full rounded-md overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(item.imageUrl)}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-lg">
                  ${item.price.toFixed(2)}
                </span>
                <span className="text-gray-500">
                  {item.preparationTime} min
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Category: {item.category}
              </div>
              <div className="text-sm text-gray-500">
                Seller: {sellersById.get(zoneSellerByZoneId.get(item.zoneId)) || 'Unknown'}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setEditingItem(item)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteMenuItem.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allMenuItems.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              No menu items yet. Create your first item to get started.
            </p>
          </CardContent>
        </Card>
      )}

      <MenuItemForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => setIsCreateDialogOpen(false)}
      />

      {editingItem && (
        <MenuItemForm
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onSuccess={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
