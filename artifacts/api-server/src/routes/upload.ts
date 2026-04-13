import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAdmin } from "../middlewares/auth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER = process.env.GITHUB_OWNER || "DavidCyril5";
const GITHUB_REPO = process.env.GITHUB_REPO || "Exam-News-Hub";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const GITHUB_IMAGES_PATH = process.env.GITHUB_IMAGES_PATH || "images";

function sanitizeFilename(original: string): string {
  const ext = original.split(".").pop()?.toLowerCase() || "jpg";
  const base = original
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  return `${base}-${Date.now()}.${ext}`;
}

router.post("/", requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    if (!GITHUB_TOKEN) {
      req.log.error("GITHUB_TOKEN env var is not set");
      res.status(500).json({ error: "GitHub token not configured" });
      return;
    }

    const filename = sanitizeFilename(req.file.originalname || "image.jpg");
    const filePath = `${GITHUB_IMAGES_PATH}/${filename}`;
    const base64Content = req.file.buffer.toString("base64");

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: `Upload image: ${filename}`,
        content: base64Content,
        branch: GITHUB_BRANCH,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      req.log.error({ status: response.status, body }, "GitHub upload error");
      res.status(500).json({ error: "Upload to GitHub failed", success: false });
      return;
    }

    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
    res.json({ url: rawUrl, success: true });
  } catch (err) {
    req.log.error({ err }, "Upload error");
    res.status(500).json({ error: "Upload failed", success: false });
  }
});

export default router;
