'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema, MenuItemFormData } from '@/lib/validations/menu';
import {
  useCreateMenuItem,
  useUpdateMenuItem,
  useUploadImage,
  useCategories,
  useCreateCategory,
} from '@/lib/hooks/use-menu';
import { MenuItem } from '@/types/menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { useState, useEffect, useMemo } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { getImageUrl } from '@/lib/utils/image';

interface MenuItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: MenuItem;
  onSuccess?: () => void;
}

export function MenuItemForm({
  open,
  onOpenChange,
  item,
  onSuccess,
}: MenuItemFormProps) {
  const isEditing = !!item;
  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const uploadImage = useUploadImage();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const createCategory = useCreateCategory();
  const { addToast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [customImagePreview, setCustomImagePreview] = useState<string | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [useFileUpload, setUseFileUpload] = useState(false);
  
  // Derive image preview from item or custom upload
  const imagePreview = useMemo(() => {
    if (customImagePreview) return customImagePreview;
    return getImageUrl(item?.imageUrl) || null;
  }, [customImagePreview, item?.imageUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          preparationTime: item.preparationTime,
          available: item.available,
          readyNow: item.readyNow || false,
          imageUrl: item.imageUrl,
        }
      : {
          available: true,
          readyNow: false,
        },
  });

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (!open) return;

    const itemData = item
      ? {
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          preparationTime: item.preparationTime,
          available: item.available,
          readyNow: item.readyNow || false,
          imageUrl: item.imageUrl,
        }
      : {
          available: true,
          readyNow: false,
        };

    reset(itemData);
  }, [open, item, reset]);

  // Clear custom image when dialog closes or item changes
  useEffect(() => {
    if (!open || !item) {
      return () => {
        setCustomImagePreview(null);
        setImageFile(null);
      };
    }
  }, [open, item]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      await createCategory.mutateAsync({ name: newCategoryName.trim() });
      setValue('category', newCategoryName.trim());
      setNewCategoryName('');
      setShowNewCategory(false);
      addToast({
        title: 'Success',
        description: 'Category created successfully',
        variant: 'success',
      });
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to create category',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: MenuItemFormData) => {
    try {
      let imageUrl = data.imageUrl || undefined;

      // Upload image if a new file was selected
      if (imageFile) {
        try {
          const uploadResult = await uploadImage.mutateAsync(imageFile);
          imageUrl = uploadResult.url;
          setValue('imageUrl', imageUrl);
        } catch {
          addToast({
            title: 'Image Upload Failed',
            description:
              'Failed to upload image. Please try again or continue without an image.',
            variant: 'destructive',
          });
          // Don't return - preserve form data and let user decide
          return;
        }
      }

      const menuItemData = {
        ...data,
        imageUrl: imageUrl || undefined,
      };

      if (isEditing) {
        await updateMenuItem.mutateAsync({
          id: item.id,
          item: menuItemData,
        });
        addToast({
          title: 'Success',
          description: 'Menu item updated successfully',
          variant: 'success',
        });
      } else {
        await createMenuItem.mutateAsync(menuItemData);
        addToast({
          title: 'Success',
          description: 'Menu item created successfully',
          variant: 'success',
        });
      }

      onSuccess?.();
      onOpenChange(false);
    } catch {
      addToast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} menu item`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Menu Item' : 'Create New Menu Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter item name"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <textarea
              id="description"
              {...register('description')}
              placeholder="Enter item description"
              className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="preparationTime">Preparation Time (min) *</Label>
              <Input
                id="preparationTime"
                type="number"
                {...register('preparationTime', { valueAsNumber: true })}
                placeholder="15"
              />
              {errors.preparationTime && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.preparationTime.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <div className="space-y-2">
              {!showNewCategory ? (
                <div className="flex gap-2">
                  <select
                    id="category"
                    {...register('category')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={categoriesLoading}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCategory(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="New category name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCategory();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddCategory}
                    disabled={createCategory.isPending || !newCategoryName.trim()}
                  >
                    {createCategory.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Add'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label>Image</Label>
            <div className="space-y-3">
              {/* Toggle between URL and File Upload */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useFileUpload"
                  checked={useFileUpload}
                  onChange={(e) => {
                    setUseFileUpload(e.target.checked);
                    if (e.target.checked) {
                      setValue('imageUrl', '');
                    } else {
                      setImageFile(null);
                      setCustomImagePreview(null);
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <Label htmlFor="useFileUpload" className="cursor-pointer text-sm">
                  Upload from device instead of URL
                </Label>
              </div>

              {!useFileUpload ? (
                <div>
                  <Label htmlFor="imageUrl" className="text-sm text-gray-600">
                    Image URL
                  </Label>
                  <Input
                    id="imageUrl"
                    {...register('imageUrl')}
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                    onChange={(e) => {
                      // Clear the value if empty to avoid validation issues
                      const value = e.target.value.trim();
                      setValue('imageUrl', value || undefined);
                    }}
                  />
                  {errors.imageUrl && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.imageUrl.message}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imageFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImageFile(null);
                        setCustomImagePreview(null);
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}

              {imagePreview && (
                <div className="relative h-32 w-full rounded-md overflow-hidden bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="available"
              type="checkbox"
              {...register('available')}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="available" className="cursor-pointer">
              Available for order
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="readyNow"
              type="checkbox"
              {...register('readyNow')}
              className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <Label htmlFor="readyNow" className="cursor-pointer">
              Ready Now (quick service item)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Item'
              ) : (
                'Create Item'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
