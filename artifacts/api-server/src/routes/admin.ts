import { Router } from "express";
import { requireAdmin, generateToken } from "../middlewares/auth";
import { Post } from "../db/models/Post";
import { Category } from "../db/models/Category";
import { Comment } from "../db/models/Comment";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      const token = generateToken({ email, role: "admin" });
      res.json({ token, admin: { email } });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/posts", requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip = (page - 1) * limit;

    const query: any = {};
    if (req.query.status && req.query.status !== "all") {
      query.status = req.query.status;
    }
    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) query.category = cat._id;
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("category")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: posts.map((p: any) => p._id) } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    commentCounts.forEach((c: any) => { countMap[c._id.toString()] = c.count; });

    const formatted = posts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      category: p.category ? { ...p.category, _id: p.category._id.toString() } : undefined,
      likesCount: p.likedBy ? p.likedBy.length : 0,
      commentsCount: countMap[p._id.toString()] || 0,
      likedBy: undefined,
    }));

    res.json({ posts: formatted, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    req.log.error({ err }, "Failed to get admin posts");
    res.status(500).json({ error: "Failed to get posts" });
  }
});

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [totalPosts, publishedPosts, draftPosts, totalCategories, totalComments, pendingComments] =
      await Promise.all([
        Post.countDocuments(),
        Post.countDocuments({ status: "published" }),
        Post.countDocuments({ status: "draft" }),
        Category.countDocuments(),
        Comment.countDocuments({ approved: true }),
        Comment.countDocuments({ approved: false }),
      ]);

    const viewsAgg = await Post.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } },
    ]);
    const likesAgg = await Post.aggregate([
      { $group: { _id: null, totalLikes: { $sum: { $size: "$likedBy" } } } },
    ]);

    const recentPostsRaw = await Post.find()
      .populate("category")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentPosts = recentPostsRaw.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      category: p.category ? { ...p.category, _id: p.category._id.toString() } : undefined,
      likesCount: p.likedBy ? p.likedBy.length : 0,
      likedBy: undefined,
    }));

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: viewsAgg[0]?.totalViews || 0,
      totalLikes: likesAgg[0]?.totalLikes || 0,
      totalComments,
      pendingComments,
      totalCategories,
      recentPosts,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Failed to get stats" });
  }
});

export default router;
