'use client';

import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/use-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { addToast } = useToast();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: newName.trim() });
      setNewName('');
      addToast({ title: 'Success', description: 'Category created', variant: 'success' });
    } catch {
      addToast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      await updateCategory.mutateAsync({ id, category: { name: editingName.trim() } });
      setEditingId(null);
      addToast({ title: 'Success', description: 'Category updated', variant: 'success' });
    } catch {
      addToast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Menu items in this category will not be deleted.')) return;
    try {
      await deleteCategory.mutateAsync(id);
      addToast({ title: 'Success', description: 'Category deleted', variant: 'success' });
    } catch {
      addToast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-gray-500 mt-1">Manage menu categories</p>
      </div>

      {/* Create new */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Category name"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="max-w-sm"
            />
            <Button onClick={handleCreate} disabled={createCategory.isPending || !newName.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="pt-6">
          {categories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories yet.</p>
          ) : (
            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="max-w-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                        autoFocus
                      />
                      <Button size="sm" variant="outline" onClick={() => handleUpdate(cat.id)} disabled={updateCategory.isPending}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{cat.name}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(cat.id)} disabled={deleteCategory.isPending}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
