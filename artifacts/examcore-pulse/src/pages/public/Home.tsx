import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PostCard } from "@/components/shared/PostCard";
import { useGetPosts, useGetCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: categoriesData } = useGetCategories();
  const { data: postsData, isLoading } = useGetPosts({ 
    category: activeCategory || undefined,
    search: searchQuery || undefined,
    limit: 12
  });

  const featuredPost = postsData?.posts?.[0];
  const gridPosts = postsData?.posts?.slice(1) || [];

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
        
        {/* Header / Filter Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeCategory === "" ? "default" : "outline"}
              onClick={() => setActiveCategory("")}
              className="rounded-full rounded-tl-sm"
            >
              Latest News
            </Button>
            {categoriesData?.map(cat => (
              <Button 
                key={cat._id}
                variant={activeCategory === cat._id ? "default" : "outline"}
                onClick={() => setActiveCategory(cat._id)}
                className="rounded-full"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search news..." 
              className="pl-9 rounded-full bg-muted/50 border-transparent focus-visible:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="w-full aspect-[21/9] rounded-3xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-[16/10] rounded-xl" />
                  <Skeleton className="w-3/4 h-6" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {featuredPost && activeCategory === "" && !searchQuery && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
                <PostCard post={featuredPost} featured />
              </section>
            )}

            {(gridPosts.length > 0 || featuredPost) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridPosts.map((post, idx) => (
                  <div key={post._id} className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out" style={{ animationDelay: `${idx * 100}ms` }}>
                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-xl font-serif">No news found.</p>
                <p className="mt-2">Try adjusting your category or search term.</p>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
