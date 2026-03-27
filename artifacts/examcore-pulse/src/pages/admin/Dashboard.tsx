import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { FileText, Eye, Heart, MessageCircle, Clock } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useGetAdminStats } from "@workspace/api-client-react";

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/admin/login");
  }, [isAuthenticated, setLocation]);

  const { data: stats, isLoading } = useGetAdminStats();

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your platform's performance.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : stats ? (
        <>
          {stats.pendingComments > 0 && (
            <div className="mb-6 flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-300">
                  {stats.pendingComments} comment{stats.pendingComments !== 1 ? "s" : ""} awaiting approval
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">Review and approve pending comments to make them visible on posts.</p>
              </div>
              <Link href="/admin/comments">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
                  Review Now
                </Button>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatsCard title="Total Posts" value={stats.totalPosts} icon={<FileText className="text-blue-500" />} />
            <StatsCard title="Total Views" value={stats.totalViews} icon={<Eye className="text-emerald-500" />} />
            <StatsCard title="Total Likes" value={stats.totalLikes} icon={<Heart className="text-rose-500" />} />
            <StatsCard title="Comments" value={stats.totalComments} icon={<MessageCircle className="text-amber-500" />} />
          </div>

          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-xl">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {stats.recentPosts?.map(post => (
                  <div key={post._id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-3 mb-1">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="rounded-md">
                          {post.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {post.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      <h4 className="font-bold text-lg text-foreground truncate">{post.title}</h4>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {post.views || 0}</span>
                      <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {post.likesCount || 0}</span>
                      <Link href={`/admin/posts/${post._id}/edit`} className="text-primary hover:underline ml-4 font-medium">Edit</Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </AdminLayout>
  );
}

function StatsCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <Card className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-foreground">{value.toLocaleString()}</h3>
        </div>
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
