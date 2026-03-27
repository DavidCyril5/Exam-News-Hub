import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAdmin } from "../middlewares/auth";
import FormData from "form-data";
import fetch from "node-fetch";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const CATBOX_API = "https://catbox.moe/user/api.php";

router.post("/", requireAdmin, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const formData = new FormData();
    formData.append("reqtype", "fileupload");
    formData.append("userhash", "");
    formData.append("fileToUpload", req.file.buffer, {
      filename: req.file.originalname || "upload.jpg",
      contentType: req.file.mimetype,
    });

    const response = await fetch(CATBOX_API, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    if (!response.ok) {
      req.log.error({ status: response.status }, "Catbox upload error");
      res.status(500).json({ error: "Upload failed", success: false });
      return;
    }

    const url = (await response.text()).trim();

    if (!url.startsWith("http")) {
      req.log.error({ url }, "Catbox returned unexpected response");
      res.status(500).json({ error: "Upload failed", success: false });
      return;
    }

    res.json({ url, success: true });
  } catch (err) {
    req.log.error({ err }, "Upload error");
    res.status(500).json({ error: "Upload failed", success: false });
  }
});

export default router;
