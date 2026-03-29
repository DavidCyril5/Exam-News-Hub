import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
  postId: mongoose.Types.ObjectId;
  ipHash: string;
  displayName: string;
  avatarColor: string;
  avatarInitials: string;
  content: string;
  approved: boolean;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    ipHash: { type: String, required: true },
    displayName: { type: String, required: true },
    avatarColor: { type: String, default: "#1e40af" },
    avatarInitials: { type: String, default: "?" },
    content: { type: String, required: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ postId: 1, createdAt: -1 });
CommentSchema.index({ approved: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
