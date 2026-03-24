import mongoose, { Schema, Document } from "mongoose";

export interface IPostImage {
  url: string;
  caption?: string;
  title?: string;
}

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: mongoose.Types.ObjectId;
  images: IPostImage[];
  coverImage?: string;
  status: "draft" | "published";
  views: number;
  likedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostImageSchema = new Schema<IPostImage>({
  url: { type: String, required: true },
  caption: { type: String, default: "" },
  title: { type: String, default: "" },
});

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    images: [PostImageSchema],
    coverImage: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    views: { type: Number, default: 0 },
    likedBy: [{ type: String }],
  },
  { timestamps: true }
);

PostSchema.index({ category: 1 });
PostSchema.index({ status: 1 });
PostSchema.index({ createdAt: -1 });

export const Post = mongoose.model<IPost>("Post", PostSchema);
