import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { Eye, Heart, MessageCircle, Clock, Share2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getVisitorId, getVisitorHeaders } from "@/lib/utils";
import { 
  useGetPost, 
  useToggleLike, 
  useGetComments, 
  useAddComment, 
  useCreateOrGetUser 
} from "@workspace/api-client-react";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const id = params?.id || "";
  const { toast } = useToast();
  
  const visitorId = getVisitorId();
  
  const { data: post, isLoading: isPostLoading, refetch: refetchPost } = useGetPost(id, {
    request: { headers: getVisitorHeaders() }
  });
  
  const { data: comments, isLoading: isCommentsLoading, refetch: refetchComments } = useGetComments(id);
  const toggleLikeMutation = useToggleLike();
  const addCommentMutation = useAddComment();
  const createUserProfileMutation = useCreateOrGetUser();

  // State for image gallery viewer
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  
  // State for commenting
  const [commentText, setCommentText] = useState("");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [storedDisplayName, setStoredDisplayName] = useState(
    typeof window !== "undefined" ? localStorage.getItem("examcore_display_name") : ""
  );

  const handleLike = () => {
    toggleLikeMutation.mutate(
      { id, data: { ipHash: visitorId } },
      {
        onSuccess: () => refetchPost()
      }
    );
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!storedDisplayName) {
      setIsNameModalOpen(true);
      return;
    }

    submitComment(storedDisplayName);
  };

  const submitComment = (name: string) => {
    addCommentMutation.mutate(
      { 
        id, 
        data: { 
          content: commentText, 
          ipHash: visitorId, 
          displayName: name 
        } 
      },
      {
        onSuccess: () => {
          setCommentText("");
          toast({
            title: "Comment submitted!",
            description: "Your comment is awaiting approval and will appear once reviewed.",
          });
        }
      }
    );
  };

  const handleSaveName = () => {
    if (!displayName.trim()) return;
    
    createUserProfileMutation.mutate(
      { data: { ipHash: visitorId, displayName } },
      {
        onSuccess: () => {
          localStorage.setItem("examcore_display_name", displayName);
          setStoredDisplayName(displayName);
          setIsNameModalOpen(false);
          submitComment(displayName);
        }
      }
    );
  };

  if (isPostLoading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
          <Skeleton className="w-full aspect-[21/9] rounded-3xl" />
          <Skeleton className="w-3/4 h-12" />
          <div className="space-y-4">
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-5/6 h-4" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="text-center py-32">
          <h1 className="text-3xl font-serif font-bold text-foreground">Post Not Found</h1>
        </div>
      </PublicLayout>
    );
  }

  const coverUrl = post.coverImage || post.images?.[0]?.url || `${import.meta.env.BASE_URL}images/placeholder-news.png`;

  return (
    <PublicLayout>
      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-16">
        
        {/* Header */}
        <header className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          {post.category && (
            <Badge className="bg-primary text-primary-foreground mb-6 font-bold tracking-wider px-3 py-1 text-sm">
              {post.category.name}
            </Badge>
          )}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm font-medium">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              {post.createdAt ? format(new Date(post.createdAt), 'MMMM d, yyyy') : 'Recent'}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" />
              {post.views || 0} Views
            </span>
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-primary" />
              {post.commentsCount || 0} Comments
            </span>
          </div>
        </header>

        {/* Cover Image */}
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden mb-12 shadow-2xl animate-in fade-in zoom-in-95 duration-1000">
          <img src={coverUrl} alt={post.title} className="w-full h-full object-cover" />
        </div>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-a:text-primary max-w-none mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <ReactMarkdown>{post.content || ""}</ReactMarkdown>
        </div>

        {/* Gallery / Timetables */}
        {post.images && post.images.length > 1 && (
          <div className="mb-16">
            <h3 className="text-2xl font-serif font-bold mb-6 border-b border-border pb-4">Gallery & Timetables</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className="cursor-pointer group relative aspect-square rounded-xl overflow-hidden bg-muted"
                  onClick={() => setActiveImageIndex(idx)}
                >
                  <img src={img.url} alt={img.title || "Gallery image"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    {img.title && <span className="text-white font-bold text-sm truncate">{img.title}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interaction Bar */}
        <div className="flex items-center justify-between py-6 border-y border-border mb-16">
          <Button 
            variant="ghost" 
            size="lg" 
            className={`gap-2 rounded-full ${post.isLikedByViewer ? 'text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/30' : ''}`}
            onClick={handleLike}
          >
            <Heart className={`w-5 h-5 ${post.isLikedByViewer ? 'fill-current' : ''}`} />
            <span className="font-bold">{post.likesCount || 0} Likes</span>
          </Button>
          
          <Button variant="outline" size="lg" className="rounded-full gap-2">
            <Share2 className="w-5 h-5" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        <section id="comments">
          <h3 className="text-2xl font-serif font-bold mb-8">Discussion ({post.commentsCount || 0})</h3>
          
          <form onSubmit={handleCommentSubmit} className="mb-12 flex flex-col gap-3">
            <Textarea 
              placeholder="What are your thoughts on this?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="min-h-[120px] rounded-2xl resize-none bg-muted/30 border-border/50 focus:bg-background"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={!commentText.trim() || addCommentMutation.isPending} className="rounded-full px-6">
                {addCommentMutation.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>

          <div className="space-y-6">
            {isCommentsLoading ? (
               <Skeleton className="w-full h-24 rounded-2xl" />
            ) : comments?.length ? (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-4 p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: comment.avatarColor || 'var(--primary)' }}
                  >
                    {comment.avatarInitials || comment.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-2">
                      <span className="font-bold text-foreground">{comment.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">Be the first to share your thoughts!</p>
            )}
          </div>
        </section>

      </article>

      {/* Name Modal for Comments */}
      <Dialog open={isNameModalOpen} onOpenChange={setIsNameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join the Discussion</DialogTitle>
            <DialogDescription>
              Please enter a display name to comment. This will be used for your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="E.g. Student2024"
              className="text-lg py-6"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNameModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveName} disabled={!displayName.trim() || createUserProfileMutation.isPending}>
              Save & Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Gallery Lightbox */}
      {activeImageIndex !== null && post.images && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
            onClick={() => setActiveImageIndex(null)}
          >
            <X className="w-8 h-8" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
            onClick={() => setActiveImageIndex((prev) => prev !== null ? (prev > 0 ? prev - 1 : post.images!.length - 1) : 0)}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>

          <img 
            src={post.images[activeImageIndex].url} 
            alt="Gallery preview" 
            className="max-h-[85vh] max-w-[90vw] object-contain"
          />

          {post.images[activeImageIndex].title && (
            <div className="absolute bottom-8 text-center max-w-2xl px-4">
              <h4 className="text-white font-bold text-xl">{post.images[activeImageIndex].title}</h4>
              {post.images[activeImageIndex].caption && (
                <p className="text-white/70 mt-2">{post.images[activeImageIndex].caption}</p>
              )}
            </div>
          )}

          <Button 
            variant="ghost" 
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 rounded-full h-12 w-12"
            onClick={() => setActiveImageIndex((prev) => prev !== null ? (prev < post.images!.length - 1 ? prev + 1 : 0) : 0)}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>
      )}
    </PublicLayout>
  );
}
