import { Router } from "express";
import { Comment } from "../db/models/Comment";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (req.query.status === "pending") filter.approved = false;
    else if (req.query.status === "approved") filter.approved = true;

    const [comments, total] = await Promise.all([
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(filter),
    ]);

    res.json({
      comments: comments.map((c: any) => ({
        ...c,
        _id: c._id.toString(),
        postId: c.postId.toString(),
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get comments");
    res.status(500).json({ error: "Failed to get comments" });
  }
});

router.patch("/:id/approve", requireAdmin, async (req, res) => {
  try {
    const { approved } = req.body;
    if (typeof approved !== "boolean") {
      res.status(400).json({ error: "approved (boolean) is required" });
      return;
    }
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { approved },
      { new: true }
    );
    if (!comment) {
      res.status(404).json({ error: "Comment not found" });
      return;
    }
    res.json({
      ...comment.toObject(),
      _id: comment._id.toString(),
      postId: comment.postId.toString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update comment approval");
    res.status(500).json({ error: "Failed to update comment" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete comment");
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

export default router;
