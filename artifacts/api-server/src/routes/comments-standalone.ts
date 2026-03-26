import { Router } from "express";
import { Comment } from "../db/models/Comment";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Comment deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete comment");
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(100)
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

export default router;
