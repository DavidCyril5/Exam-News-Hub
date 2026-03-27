import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ImagePlus, Save, ArrowLeft, X } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  useGetCategories, 
  useCreatePost, 
  useUpdatePost, 
  useGetPost,
  useUploadImage
} from "@workspace/api-client-react";

type PostImageInput = { url: string; title: string; caption: string };

export default function PostEditor() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/admin/posts/:id/edit");
  const isEditing = !!params?.id;
  const postId = params?.id || "";
  
  const { toast } = useToast();
  
  const { data: categories } = useGetCategories();
  const { data: existingPost, isLoading: isLoadingPost } = useGetPost(postId, {
    query: { enabled: isEditing }
  });

  const createMutation = useCreatePost();
  const updateMutation = useUpdatePost();
  const uploadMutation = useUploadImage();

  // Form State
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [images, setImages] = useState<PostImageInput[]>([]);

  // Prefill when editing
  useEffect(() => {
    if (isEditing && existingPost) {
      setTitle(existingPost.title);
      setCategoryId(existingPost.category?._id || "");
      setExcerpt(existingPost.excerpt || "");
      setContent(existingPost.content || "");
      setCoverImage(existingPost.coverImage || "");
      setStatus(existingPost.status as "draft" | "published");
      setImages(existingPost.images?.map(i => ({ url: i.url, title: i.title || "", caption: i.caption || "" })) || []);
    }
  }, [existingPost, isEditing]);

  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    toast({ title: "Uploading cover image..." });
    uploadMutation.mutate(
      { data: { file } },
      {
        onSuccess: (res) => {
          setCoverImage(res.url);
          toast({ title: "Cover image uploaded" });
        }
      }
    );
  };

  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    toast({ title: "Uploading gallery image..." });
    uploadMutation.mutate(
      { data: { file } },
      {
        onSuccess: (res) => {
          setImages(prev => [...prev, { url: res.url, title: "", caption: "" }]);
          toast({ title: "Gallery image added" });
        }
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title,
      categoryId,
      excerpt,
      content,
      coverImage,
      status,
      images
    };

    const options = {
      onSuccess: () => {
        toast({ title: `Post ${isEditing ? 'updated' : 'created'} successfully!` });
        setLocation("/admin/posts");
      }
    };

    if (isEditing) {
      updateMutation.mutate({ id: postId, data: payload }, options);
    } else {
      createMutation.mutate({ data: payload }, options);
    }
  };

  if (isEditing && isLoadingPost) return <AdminLayout><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit}>
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => setLocation("/admin/posts")} type="button">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground">
                {isEditing ? "Edit Post" : "Create New Post"}
              </h1>
            </div>
          </div>
          <div className="flex gap-4">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Save as Draft</option>
              <option value="published">Published</option>
            </select>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="shadow-lg shadow-primary/20">
              <Save className="w-4 h-4 mr-2" />
              Save Post
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-bold mb-2 block">Title</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title..." className="text-lg py-6" required />
                </div>
                
                <div>
                  <label className="text-sm font-bold mb-2 block">Excerpt (Short description)</label>
                  <Textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Summary..." className="h-20 resize-none" />
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Content (Markdown supported)</label>
                  <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Write the full article here..." className="min-h-[400px] font-mono text-sm" required />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-bold block">Gallery / Timetables</label>
                <div>
                  <input type="file" id="galleryUpload" className="hidden" accept="image/*" onChange={handleUploadGalleryImage} />
                  <label htmlFor="galleryUpload" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-9 px-4 py-2 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground">
                    <ImagePlus className="w-4 h-4 mr-2" /> Add Image
                  </label>
                </div>
              </div>

              {images.length > 0 ? (
                <div className="space-y-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="flex gap-4 p-4 border rounded-xl bg-muted/20">
                      <img src={img.url} className="w-24 h-24 object-cover rounded-lg" alt="" />
                      <div className="flex-1 space-y-3">
                        <Input placeholder="Image Title (e.g. WAEC Timetable 2024)" value={img.title} onChange={e => {
                          const newImgs = [...images]; newImgs[idx].title = e.target.value; setImages(newImgs);
                        }} />
                        <Input placeholder="Caption" value={img.caption} onChange={e => {
                          const newImgs = [...images]; newImgs[idx].caption = e.target.value; setImages(newImgs);
                        }} />
                      </div>
                      <Button variant="ghost" size="icon" className="text-rose-500" onClick={() => setImages(images.filter((_, i) => i !== idx))}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-xl">
                  No gallery images added yet.
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <label className="text-sm font-bold mb-3 block">Category</label>
              <select 
                value={categoryId} 
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring outline-none"
                required
              >
                <option value="" disabled>Select a category...</option>
                {categories?.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </Card>

            <Card className="p-6">
              <label className="text-sm font-bold mb-3 block">Cover Image</label>
              {coverImage ? (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-4 group border border-border">
                  <img src={coverImage} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => setCoverImage("")}>Remove</Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 mb-4">
                  <span className="text-sm text-muted-foreground">No cover image</span>
                </div>
              )}
              
              <input type="file" id="coverUpload" className="hidden" accept="image/*" onChange={handleUploadCover} />
              <label htmlFor="coverUpload" className="cursor-pointer flex items-center justify-center w-full rounded-md text-sm font-medium h-10 px-4 py-2 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80">
                <ImagePlus className="w-4 h-4 mr-2" /> {coverImage ? "Change Image" : "Upload Cover"}
              </label>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
