import { AdminLayout } from "@/components/layout/AdminLayout";

export default function AdminComments() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">Manage Comments</h1>
        <p className="text-muted-foreground mt-1">Review and moderate user discussions across all posts.</p>
      </div>
      
      <div className="bg-card border border-border/50 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="text-xl font-bold mb-2">Global Comments View</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          This feature provides a unified stream of comments. Currently under construction as the global API endpoint is being finalized. 
          You can delete specific comments by viewing the post details.
        </p>
      </div>
    </AdminLayout>
  );
}
