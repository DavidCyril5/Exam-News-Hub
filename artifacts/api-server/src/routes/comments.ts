import { Router } from "express";
import { Comment } from "../db/models/Comment";
import { Post } from "../db/models/Post";
import { requireAdmin } from "../middlewares/auth";

const router = Router({ mergeParams: true });

const AVATAR_COLORS = [
  "#1e40af", "#7c3aed", "#dc2626", "#059669", "#d97706",
  "#db2777", "#0891b2", "#65a30d", "#c2410c", "#4338ca"
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColor(ipHash: string): string {
  let hash = 0;
  for (let i = 0; i < ipHash.length; i++) {
    hash = (hash << 5) - hash + ipHash.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

router.get("/:postId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId })
      .sort({ createdAt: -1 })
      .lean();
    res.json(
      comments.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        postId: c.postId.toString(),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to get comments");
    res.status(500).json({ error: "Failed to get comments" });
  }
});

router.post("/:postId/comments", async (req, res) => {
  try {
    const { content, ipHash, displayName } = req.body;
    if (!content || !ipHash || !displayName) {
      res.status(400).json({ error: "content, ipHash, displayName required" });
      return;
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const avatarColor = getColor(ipHash);
    const avatarInitials = getInitials(displayName);

    const comment = await Comment.create({
      postId: req.params.postId,
      ipHash,
      displayName,
      avatarColor,
      avatarInitials,
      content,
    });

    res.status(201).json({
      ...comment.toObject(),
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to add comment");
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
