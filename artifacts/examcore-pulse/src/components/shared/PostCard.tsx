import { Link } from "wouter";
import { format } from "date-fns";
import { Eye, Heart, MessageCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Post } from "@workspace/api-client-react.schemas";

export function PostCard({ post, featured = false }: { post: Post, featured?: boolean }) {
  const imageUrl = post.coverImage || post.images?.[0]?.url || `${import.meta.env.BASE_URL}images/placeholder-news.png`;
  
  if (featured) {
    return (
      <Link href={`/post/${post._id}`} className="block group">
        <Card className="relative overflow-hidden border-0 bg-transparent rounded-2xl md:rounded-3xl shadow-2xl transition-transform duration-500 hover:-translate-y-1">
          <div className="aspect-[16/9] md:aspect-[21/9] w-full relative">
            <img 
              src={imageUrl} 
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full max-w-4xl flex flex-col gap-4">
              {post.category && (
                <Badge className="w-fit bg-primary text-primary-foreground border-none font-bold tracking-wider px-3 py-1">
                  {post.category.name}
                </Badge>
              )}
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
                {post.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white/80 text-sm font-medium mt-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Recent'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  {post.views || 0}
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-primary" />
                  {post.likesCount || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/post/${post._id}`} className="block group h-full">
      <Card className="h-full flex flex-col overflow-hidden border-border/50 bg-card hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300">
        <div className="aspect-[16/10] overflow-hidden relative bg-muted">
          <img 
            src={imageUrl} 
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {post.category && (
            <Badge className="absolute top-4 left-4 bg-background/90 backdrop-blur text-foreground border-none shadow-sm font-bold">
              {post.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-6 flex-1 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1">
            <Clock className="w-3.5 h-3.5" />
            {post.createdAt ? format(new Date(post.createdAt), 'MMM d, yyyy') : 'Recent'}
          </div>
          <h3 className="text-xl font-serif font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-3">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2 mt-auto">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 pt-4 mt-auto border-t border-border/50 text-muted-foreground text-sm font-medium">
            <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Eye className="w-4 h-4" />
              {post.views || 0}
            </span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <Heart className="w-4 h-4" />
              {post.likesCount || 0}
            </span>
            <span className="flex items-center gap-1.5 hover:text-foreground transition-colors ml-auto">
              <MessageCircle className="w-4 h-4" />
              {post.commentsCount || 0}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
