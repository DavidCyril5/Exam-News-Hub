import { useRoute } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { PostCard } from "@/components/shared/PostCard";
import { useGetPosts, useGetCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoryView() {
  const [, params] = useRoute("/category/:slug");
  const slug = params?.slug || "";
  
  const { data: categories } = useGetCategories();
  
  // Find category ID by slug. If API doesn't support slug directly in getPosts, we map it.
  const category = categories?.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  const categoryId = category?._id;

  const { data: postsData, isLoading } = useGetPosts(
    categoryId ? { category: categoryId } : {},
    { query: { enabled: !!categories } } // Wait until categories load so we know ID
  );

  return (
    <PublicLayout>
      <div className="bg-secondary text-secondary-foreground py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://pixabay.com/get/g287e7abee32262e46098277baaa1d7597c5a8d228d5ede7f30ad632f11c7432dc1d04c3ab1084131a5f561da9f640fcc5852c0c0505ad0619b49dd683267a2ff_1280.jpg')] opacity-10 mix-blend-overlay object-cover" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 uppercase tracking-wider break-words">
            {slug.replace('-', ' ')} NEWS
          </h1>
          <p className="text-secondary-foreground/80 max-w-2xl mx-auto text-lg">
            {category?.description || `The latest updates, timetables, and news regarding ${slug.toUpperCase()} examinations.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="space-y-4">
                <Skeleton className="w-full aspect-[16/10] rounded-xl" />
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
              </div>
            ))}
          </div>
        ) : postsData?.posts?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {postsData.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
           <div className="text-center py-20 text-muted-foreground">
             <p className="text-xl font-serif">No posts found in this category.</p>
           </div>
        )}
      </div>
    </PublicLayout>
  );
}
