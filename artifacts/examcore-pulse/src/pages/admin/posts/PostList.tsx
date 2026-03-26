import { useState } from "react";
import { Link } from "wouter";
import { format } from "date-fns";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeaders } from "@/lib/utils";
import { useGetAdminPosts, useDeletePost } from "@workspace/api-client-react";

export default function AdminPostList() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  
  const { data, isLoading, refetch } = useGetAdminPosts(
    { page, limit: 20, status: "all" },
    { request: { headers: getAuthHeaders() } }
  );

  const deleteMutation = useDeletePost();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(
        { id },
        {
          request: { headers: getAuthHeaders() },
          onSuccess: () => {
            toast({ title: "Post deleted" });
            refetch();
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Manage Posts</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and publish your news articles.</p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20 self-start sm:self-auto">
          <Link href="/admin/posts/new">
            <PlusCircle className="w-5 h-5 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">Loading posts...</td></tr>
              ) : data?.posts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No posts found.</td></tr>
              ) : (
                data?.posts.map((post) => (
                  <tr key={post._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{post.title}</td>
                    <td className="px-6 py-4">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                        {post.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {post.category?.name || '-'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                          <Link href={`/admin/posts/${post._id}/edit`}><Edit className="w-4 h-4" /></Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                          onClick={() => handleDelete(post._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}
