import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { FileText, Eye, Heart, MessageCircle, Clock, Bell, Users, Send } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useGetAdminStats } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

function usePushPanel(token: string | null) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [subCount, setSubCount] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!token) return;
    fetch("/api/push/subscriber-count", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setSubCount(d.count ?? 0))
      .catch(() => {});
  }, [token]);

  const send = async () => {
    if (!title.trim() || !body.trim() || !token) return;
    setSending(true);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Notification sent", description: `Delivered to ${data.sent} subscriber(s).` });
        setTitle("");
        setBody("");
      } else {
        toast({ title: "Failed to send", description: data.error, variant: "destructive" });
      }
    } finally {
      setSending(false);
    }
  };

  return { title, setTitle, body, setBody, sending, send, subCount };
}

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) setLocation("/admin/login");
  }, [isAuthenticated, setLocation]);

  const { data: stats, isLoading } = useGetAdminStats();

  const rawToken = typeof window !== "undefined" ? localStorage.getItem("examcore_admin_token") : null;
  const token = rawToken ? (() => { try { return JSON.parse(rawToken); } catch { return rawToken; } })() : null;
  const push = usePushPanel(token);

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

          <Card className="rounded-2xl border-border/50 shadow-sm mb-6">
            <CardHeader className="border-b border-border/50 bg-muted/20 flex flex-row items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Push Notifications</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {push.subCount === null ? "Loading subscribers…" : `${push.subCount} active subscriber${push.subCount !== 1 ? "s" : ""}`}
                </p>
              </div>
              {push.subCount !== null && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-foreground">{push.subCount}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="Notification title"
                  value={push.title}
                  onChange={(e) => push.setTitle(e.target.value)}
                  maxLength={80}
                />
                <Textarea
                  placeholder="Notification message"
                  value={push.body}
                  onChange={(e) => push.setBody(e.target.value)}
                  rows={3}
                  maxLength={200}
                  className="resize-none"
                />
              </div>
              <Button
                onClick={push.send}
                disabled={push.sending || !push.title.trim() || !push.body.trim()}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {push.sending ? "Sending…" : "Send to All Subscribers"}
              </Button>
              <p className="text-xs text-muted-foreground">
                New posts published from the editor automatically trigger a push notification.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardTitle className="text-xl">Recent Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/50">
                {stats.recentPosts?.map(post => (
                  <div key={post._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0 sm:pr-6">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="rounded-md text-xs">
                          {post.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                          {post.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      <h4 className="font-bold text-base sm:text-lg text-foreground line-clamp-2">{post.title}</h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" /> {post.views || 0}</span>
                      <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {post.likesCount || 0}</span>
                      <Link href={`/admin/posts/${post._id}/edit`} className="text-primary hover:underline font-medium">Edit</Link>
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
