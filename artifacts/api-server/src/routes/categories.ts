import { Router } from "express";
import { Category } from "../db/models/Category";
import { Post } from "../db/models/Post";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 }).lean();
    const withCounts = await Promise.all(
      categories.map(async (cat) => {
        const postCount = await Post.countDocuments({ category: cat._id, status: "published" });
        return { ...cat, _id: cat._id.toString(), postCount };
      })
    );
    res.json(withCounts);
  } catch (err) {
    req.log.error({ err }, "Failed to get categories");
    res.status(500).json({ error: "Failed to get categories" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { name, description, color } = req.body;
    const slug = toSlug(name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      res.status(400).json({ error: "Category already exists" });
      return;
    }
    const category = await Category.create({ name, slug, description, color: color || "#1e40af" });
    res.status(201).json({ ...category.toObject(), _id: category._id.toString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Failed to create category" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete category");
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
