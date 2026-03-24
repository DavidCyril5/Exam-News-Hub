import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  ipHash: string;
  displayName?: string;
  avatarColor: string;
  avatarInitials: string;
  createdAt: Date;
}

const AVATAR_COLORS = [
  "#1e40af", "#7c3aed", "#dc2626", "#059669", "#d97706",
  "#db2777", "#0891b2", "#65a30d", "#c2410c", "#4338ca"
];

const UserProfileSchema = new Schema<IUserProfile>(
  {
    ipHash: { type: String, required: true, unique: true },
    displayName: { type: String, default: "" },
    avatarColor: { type: String, default: AVATAR_COLORS[0] },
    avatarInitials: { type: String, default: "?" },
  },
  { timestamps: true }
);

export const UserProfile = mongoose.model<IUserProfile>("UserProfile", UserProfileSchema);
export { AVATAR_COLORS };
