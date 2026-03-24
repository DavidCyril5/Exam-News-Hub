import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAdmin } from "../middlewares/auth";
import FormData from "form-data";
import fetch from "node-fetch";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const UPLOAD_API = "https://rynekoo-api.hf.space/tools/uploader/alibaba";

router.post("/", requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname || "upload.jpg",
      contentType: req.file.mimetype,
    });
    formData.append("filename", req.file.originalname || "upload.jpg");

    const response = await fetch(UPLOAD_API, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      req.log.error({ status: response.status }, "Upload API error");
      res.status(500).json({ error: "Upload failed" });
      return;
    }

    const data = await response.json() as any;
    if (data.success && data.result) {
      res.json({ url: data.result, success: true });
    } else {
      res.status(500).json({ error: "Upload failed", success: false });
    }
  } catch (err) {
    req.log.error({ err }, "Upload error");
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
