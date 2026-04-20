'use client';

import { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/lib/hooks/use-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Plus, Pencil, Trash2, Check, X, Layers } from 'lucide-react';
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Categories</h1>
        <p className="text-gray-600 mt-1">Group menu items — names appear in the seller menu editor</p>
      </div>

      <Card className="border-0 shadow-lg shadow-orange-900/5 overflow-hidden bg-white/90 backdrop-blur-sm ring-1 ring-orange-100">
        <CardHeader className="border-b border-orange-100/80 bg-gradient-to-r from-orange-50 to-amber-50/80 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/30">
              <Plus className="h-5 w-5" />
            </span>
            Add category
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 min-w-0">
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Name</label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Burgers, Drinks, Desserts"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="h-11 border-orange-200/80 focus-visible:ring-orange-500"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={createCategory.isPending || !newName.trim()}
              className="h-11 shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add category
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-orange-800/80 mb-4">
          All categories ({categories.length})
        </h2>
        {categories.length === 0 ? (
          <Card className="border-dashed border-2 border-orange-200 bg-orange-50/40">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-orange-100">
                <Layers className="h-7 w-7 text-orange-400" />
              </div>
              <p className="text-gray-600 font-medium">No categories yet</p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">Create your first category above so sellers can assign items to it.</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => (
              <li key={cat.id}>
                <Card
                  className="group h-full border-0 bg-white/95 shadow-md shadow-orange-900/5 ring-1 ring-orange-100/90 transition-all hover:shadow-lg hover:shadow-orange-500/10 hover:ring-orange-200/90 hover:-translate-y-0.5"
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 px-4 py-5">
                      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" aria-hidden />
                      <div className="relative flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm ring-1 ring-white/30 text-sm font-bold tabular-nums">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wider text-white/80">Category</p>
                            {editingId === cat.id ? (
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="mt-1 h-9 bg-white/95 border-0 text-gray-900 font-semibold shadow-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                                autoFocus
                              />
                            ) : (
                              <p className="mt-0.5 text-lg font-bold text-white truncate drop-shadow-sm" title={cat.name}>
                                {cat.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          {editingId === cat.id ? (
                            <>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-9 w-9 bg-white/90 text-green-700 hover:bg-white shadow-sm"
                                onClick={() => handleUpdate(cat.id)}
                                disabled={updateCategory.isPending}
                                aria-label="Save"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-9 w-9 bg-white/90 text-gray-700 hover:bg-white shadow-sm"
                                onClick={() => setEditingId(null)}
                                aria-label="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-9 w-9 bg-white/20 text-white border-0 hover:bg-white/30 backdrop-blur-sm"
                                onClick={() => {
                                  setEditingId(cat.id);
                                  setEditingName(cat.name);
                                }}
                                aria-label="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="secondary"
                                className="h-9 w-9 bg-white/20 text-white border-0 hover:bg-red-500/90 hover:text-white backdrop-blur-sm"
                                onClick={() => handleDelete(cat.id)}
                                disabled={deleteCategory.isPending}
                                aria-label="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 bg-gradient-to-b from-amber-50/30 to-white rounded-b-xl border-t border-orange-100/60">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-orange-400" />
                        Menu grouping
                      </span>
                      <span className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]" title={cat.id}>
                        {cat.id.slice(0, 8)}…
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
