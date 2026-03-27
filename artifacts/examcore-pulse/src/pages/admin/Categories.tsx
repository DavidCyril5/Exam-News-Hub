import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetCategories, useCreateCategory, useDeleteCategory } from "@workspace/api-client-react";

export default function AdminCategories() {
  const { toast } = useToast();
  const { data: categories, isLoading, refetch } = useGetCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    createMutation.mutate(
      { data: { name: newCatName, description: newCatDesc } },
      {
        onSuccess: () => {
          setNewCatName("");
          setNewCatDesc("");
          refetch();
          toast({ title: "Category created" });
        }
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this category? Posts assigned to it might lose their category reference.")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            refetch();
            toast({ title: "Category deleted" });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Categories</h1>
        <p className="text-muted-foreground mt-1">Manage post categories like WAEC, JAMB, etc.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-border/50 shadow-sm sticky top-24">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Add New Category</h3>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. POST-UTME" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <Input value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} placeholder="Brief description..." />
                </div>
                <Button type="submit" className="w-full mt-2 shadow-lg shadow-primary/20" disabled={createMutation.isPending}>
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <p>Loading categories...</p>
          ) : categories?.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground border-dashed">
              No categories found. Create one first!
            </Card>
          ) : (
            categories?.map(cat => (
              <Card key={cat._id} className="rounded-xl border-border/50 shadow-sm hover:border-primary/20 transition-colors">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-lg text-foreground">{cat.name}</h4>
                    <p className="text-sm text-muted-foreground">{cat.slug}</p>
                    {cat.description && <p className="text-sm mt-2">{cat.description}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
                      {cat.postCount || 0} posts
                    </span>
                    <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(cat._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
