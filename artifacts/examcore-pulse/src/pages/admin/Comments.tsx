import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Trash2, MessageCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAdminComments, useApproveComment, useDeleteComment } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Link } from "wouter";

type StatusFilter = "pending" | "approved" | "all";

export default function AdminComments() {
  const { toast } = useToast();
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetAdminComments({ status, page, limit: 20 });
  const approveMutation = useApproveComment();
  const deleteMutation = useDeleteComment();

  const handleApprove = (id: string) => {
    approveMutation.mutate(
      { id, data: { approved: true } },
      {
        onSuccess: () => {
          toast({ title: "Comment approved" });
          refetch();
        },
      }
    );
  };

  const handleReject = (id: string) => {
    approveMutation.mutate(
      { id, data: { approved: false } },
      {
        onSuccess: () => {
          toast({ title: "Comment rejected" });
          refetch();
        },
      }
    );
  };

  const handleDelete = (id: string) => {
    if (confirm("Permanently delete this comment?")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Comment deleted" });
            refetch();
          },
        }
      );
    }
  };

  const tabs: { label: string; value: StatusFilter; description: string }[] = [
    { label: "Pending", value: "pending", description: "Awaiting review" },
    { label: "Approved", value: "approved", description: "Live on site" },
    { label: "All", value: "all", description: "All comments" },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Manage Comments</h1>
        <p className="text-muted-foreground mt-1">Review and moderate user discussions across all posts.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1); }}
            className={`pb-3 px-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
              status === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {status === tab.value && data && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {data.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Comment List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : !data?.comments?.length ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold mb-1">
            {status === "pending" ? "No pending comments" : status === "approved" ? "No approved comments" : "No comments yet"}
          </h3>
          <p className="text-muted-foreground text-sm">
            {status === "pending" ? "All caught up! No comments awaiting review." : "Comments will appear here once submitted."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.comments.map((comment) => (
            <div
              key={comment._id}
              className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-start gap-4"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: comment.avatarColor || "#1e40af" }}
              >
                {comment.avatarInitials || comment.displayName.charAt(0).toUpperCase()}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-foreground text-sm">{comment.displayName}</span>
                  <Badge
                    variant={comment.approved ? "default" : "secondary"}
                    className={`text-xs ${comment.approved ? "bg-green-100 text-green-700 border-green-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}
                  >
                    {comment.approved ? (
                      <><Check className="w-3 h-3 mr-1" />Approved</>
                    ) : (
                      <><Clock className="w-3 h-3 mr-1" />Pending</>
                    )}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>

                <p className="text-sm text-foreground/90 mb-2 line-clamp-3">{comment.content}</p>

                <Link
                  href={`/post/${comment.postId}`}
                  className="text-xs text-primary hover:underline"
                  target="_blank"
                >
                  View post →
                </Link>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0 sm:flex-col sm:items-end">
                {!comment.approved ? (
                  <Button
                    size="sm"
                    onClick={() => handleApprove(comment._id)}
                    disabled={approveMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-3"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(comment._id)}
                    disabled={approveMutation.isPending}
                    className="text-amber-600 border-amber-300 hover:bg-amber-50 text-xs h-8 px-3"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(comment._id)}
                  disabled={deleteMutation.isPending}
                  className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-8 px-3"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
