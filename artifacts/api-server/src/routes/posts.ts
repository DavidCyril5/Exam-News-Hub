import { Router } from "express";
import PDFDocument from "pdfkit";
import { Post } from "../db/models/Post";
import { Category } from "../db/models/Category";
import { Comment } from "../db/models/Comment";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function toSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base}-${Date.now()}`;
}

function formatPost(post: any) {
  const obj = post.toObject ? post.toObject() : post;
  return {
    ...obj,
    _id: obj._id.toString(),
    category: obj.category
      ? typeof obj.category === "object" && obj.category._id
        ? { ...obj.category, _id: obj.category._id.toString() }
        : obj.category
      : undefined,
    likesCount: obj.likedBy ? obj.likedBy.length : 0,
    likedBy: undefined,
  };
}

router.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip = (page - 1) * limit;

    const query: any = { status: "published" };

    if (req.query.category) {
      const cat = await Category.findOne({ slug: req.query.category });
      if (cat) query.category = cat._id;
    }

    if (req.query.search) {
      const search = req.query.search as string;
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
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

    const formattedPosts = posts.map((p: any) => ({
      ...p,
      _id: p._id.toString(),
      category: p.category ? { ...p.category, _id: p.category._id.toString() } : undefined,
      likesCount: p.likedBy ? p.likedBy.length : 0,
      commentsCount: 0,
      likedBy: undefined,
    }));

    const postIds = formattedPosts.map((p: any) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: posts.map((p: any) => p._id) } } },
      { $group: { _id: "$postId", count: { $sum: 1 } } },
    ]);
    const countMap: Record<string, number> = {};
    commentCounts.forEach((c: any) => { countMap[c._id.toString()] = c.count; });

    const withCommentCounts = formattedPosts.map((p: any) => ({
      ...p,
      commentsCount: countMap[p._id] || 0,
    }));

    res.json({
      posts: withCommentCounts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get posts");
    res.status(500).json({ error: "Failed to get posts" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, categoryId, images, coverImage, status, pdfDownloadEnabled, pdfButtonLabel } = req.body;
    const slug = toSlug(title);
    const post = await Post.create({
      title,
      slug,
      content,
      excerpt: excerpt || "",
      category: categoryId,
      images: images || [],
      coverImage: coverImage || "",
      status: status || "draft",
      pdfDownloadEnabled: pdfDownloadEnabled !== undefined ? pdfDownloadEnabled : true,
      pdfButtonLabel: pdfButtonLabel || "Download Timetable PDF",
    });
    const populated = await Post.findById(post._id).populate("category").lean();
    res.status(201).json(formatPost({ toObject: () => populated, ...populated }));
  } catch (err) {
    req.log.error({ err }, "Failed to create post");
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const viewerId = req.headers["x-viewer-id"] as string | undefined;
    const post = await Post.findById(req.params.id).populate("category");
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    post.views += 1;
    await post.save();

    const commentsCount = await Comment.countDocuments({ postId: post._id });
    const isLikedByViewer = viewerId ? post.likedBy.includes(viewerId) : false;

    const obj = post.toObject() as any;
    res.json({
      ...obj,
      _id: obj._id.toString(),
      category: obj.category ? { ...obj.category, _id: obj.category._id.toString() } : undefined,
      likesCount: obj.likedBy.length,
      commentsCount,
      isLikedByViewer,
      likedBy: undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get post");
    res.status(500).json({ error: "Failed to get post" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const { title, content, excerpt, categoryId, images, coverImage, status, pdfDownloadEnabled, pdfButtonLabel } = req.body;
    const update: any = { title, content, excerpt, images, coverImage, status };
    if (categoryId) update.category = categoryId;
    if (pdfDownloadEnabled !== undefined) update.pdfDownloadEnabled = pdfDownloadEnabled;
    if (pdfButtonLabel !== undefined) update.pdfButtonLabel = pdfButtonLabel;

    const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("category")
      .lean();
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(formatPost({ toObject: () => post, ...post }));
  } catch (err) {
    req.log.error({ err }, "Failed to update post");
    res.status(500).json({ error: "Failed to update post" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ postId: req.params.id });
    res.json({ success: true, message: "Post deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete post");
    res.status(500).json({ error: "Failed to delete post" });
  }
});

router.post("/:id/like", async (req, res) => {
  try {
    const { ipHash } = req.body;
    if (!ipHash) {
      res.status(400).json({ error: "ipHash required" });
      return;
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    const idx = post.likedBy.indexOf(ipHash);
    let liked: boolean;
    if (idx > -1) {
      post.likedBy.splice(idx, 1);
      liked = false;
    } else {
      post.likedBy.push(ipHash);
      liked = true;
    }
    await post.save();
    res.json({ liked, likesCount: post.likedBy.length });
  } catch (err) {
    req.log.error({ err }, "Failed to toggle like");
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// Generate a timetable PDF from the post's gallery images
router.get("/:id/timetable.pdf", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    if (!post) return res.status(404).json({ error: "Post not found" });

    const images: Array<{ url: string; title?: string; caption?: string }> = (post as any).images || [];
    if (images.length === 0) return res.status(404).json({ error: "This post has no timetable images" });

    // Fetch all image buffers in parallel
    const buffers: Array<{ buf: Buffer; mime: string; title?: string; caption?: string } | null> =
      await Promise.all(
        images.map(async (img) => {
          try {
            const r = await fetch(img.url);
            if (!r.ok) return null;
            const arrayBuf = await r.arrayBuffer();
            const contentType = r.headers.get("content-type") || "image/jpeg";
            return { buf: Buffer.from(arrayBuf), mime: contentType, title: img.title, caption: img.caption };
          } catch {
            return null;
          }
        })
      );

    const valid = buffers.filter(Boolean) as Array<{ buf: Buffer; mime: string; title?: string; caption?: string }>;
    if (valid.length === 0) return res.status(500).json({ error: "Could not download any images" });

    const safeTitle = ((post as any).title as string || "timetable")
      .replace(/[^a-z0-9 ]/gi, " ")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${safeTitle}.pdf"`);

    const doc = new PDFDocument({ autoFirstPage: false, margin: 0, bufferPages: true });
    doc.pipe(res);

    for (const item of valid) {
      // Read image dimensions via pdfkit
      const img = doc.openImage(item.buf);
      const A4_W = 595.28;
      const A4_H = 841.89;
      const PADDING = 20;
      const availW = A4_W - PADDING * 2;
      const availH = A4_H - PADDING * 2 - (item.title || item.caption ? 40 : 0);

      const scale = Math.min(availW / img.width, availH / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const x = (A4_W - drawW) / 2;
      const captionOffset = item.title || item.caption ? 36 : 0;
      const y = (A4_H - drawH - captionOffset) / 2;

      doc.addPage({ size: "A4" });

      if (item.title) {
        doc.fontSize(13).font("Helvetica-Bold").fillColor("#1a1a1a")
          .text(item.title, PADDING, PADDING, { width: availW, align: "center" });
      }
      if (item.caption) {
        doc.fontSize(10).font("Helvetica").fillColor("#555555")
          .text(item.caption, PADDING, item.title ? PADDING + 18 : PADDING, { width: availW, align: "center" });
      }

      doc.image(item.buf, x, y + captionOffset, { width: drawW, height: drawH });
    }

    // Footer on every page
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(pages.start + i);
      doc.fontSize(8).font("Helvetica").fillColor("#aaaaaa")
        .text(
          `EXAMCORE PULSE  •  Page ${i + 1} of ${pages.count}  •  examcore-pulse`,
          0, 825, { width: 595.28, align: "center" }
        );
    }

    doc.end();
  } catch (err) {
    req.log.error({ err }, "Failed to generate timetable PDF");
    if (!res.headersSent) res.status(500).json({ error: "Failed to generate PDF" });
  }
});

export default router;
