'use client';

import { useState } from 'react';
import { useSellerZones, useSellerMenu } from '@/lib/hooks/use-seller';
import { useDeleteMenuItem } from '@/lib/hooks/use-menu';
import { MenuItemForm } from '@/components/features/menu-item-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Pencil, Trash2, Utensils, Clock, DollarSign } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { getImageUrl } from '@/lib/utils/image';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function SellerMenuPage() {
  const { data: zones = [] } = useSellerZones();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const { data: items = [], isLoading } = useSellerMenu(selectedZoneId || undefined);
  const deleteItem = useDeleteMenuItem();
  const { addToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteItem.mutateAsync(confirmDeleteId);
      addToast({ title: 'Deleted', description: 'Item deleted.', variant: 'success' });
      setConfirmDeleteId(null);
    } catch {
      addToast({ title: 'Error', description: 'Failed to delete.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products and their availability</p>
        </div>
        <Button 
          onClick={() => setIsCreateOpen(true)} 
          className="bg-orange-500 hover:bg-orange-600 text-white min-h-[44px] shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Item
        </Button>
      </div>

      {/* Zone filter */}
      <Card className="border-orange-100 bg-orange-50/20">
        <CardContent className="p-4 flex items-center gap-4">
          <Utensils className="h-5 w-5 text-orange-500" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Filter by zone:</label>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="w-full sm:w-64 border border-orange-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            >
              <option value="">All delivery zones</option>
              {zones.map((z: any) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]"><LoadingSpinner /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.length === 0 ? (
            <Card className="col-span-full border-dashed border-2 border-orange-100 bg-orange-50/30">
              <CardContent className="py-12 text-center">
                <div className="bg-orange-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-1">
                  {selectedZoneId ? "No items found for this specific zone." : "You haven't added any items to your menu yet."}
                </p>
              </CardContent>
            </Card>
          ) : items.map((item: any) => (
            <Card key={item.id} className="overflow-hidden border-orange-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="relative h-48 w-full bg-gray-100">
                {item.imageUrl ? (
                  <img 
                    src={getImageUrl(item.imageUrl)} 
                    alt={item.name} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <Utensils className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Badge className={item.available ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                {item.category && (
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-gray-700 border-none">
                      {item.category}
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">{item.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="p-4 pt-0 space-y-4 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">{item.description}</p>
                
                <div className="flex items-center justify-between py-2 border-y border-orange-50 mt-auto">
                  <div className="flex items-center text-orange-600 font-bold text-lg">
                    <DollarSign className="h-4 w-4 mr-0.5" />
                    {Number(item.price).toFixed(2)}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1 text-orange-400" />
                    {item.preparationTime} min
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-orange-100 text-orange-600 hover:bg-orange-50 min-h-[36px]" 
                    onClick={() => setEditingItem(item)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 min-h-[36px]" 
                    onClick={() => setConfirmDeleteId(item.id)} 
                    disabled={deleteItem.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <MenuItemForm open={isCreateOpen} onOpenChange={setIsCreateOpen} onSuccess={() => setIsCreateOpen(false)} />
      {editingItem && (
        <MenuItemForm open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)} item={editingItem} onSuccess={() => setEditingItem(null)} />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Delete Menu Item?"
        description="Are you sure you want to remove this item from your menu? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="danger"
        isLoading={deleteItem.isPending}
      />
    </div>
  );
}
