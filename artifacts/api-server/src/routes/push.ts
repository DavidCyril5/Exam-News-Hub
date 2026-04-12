import { Router } from "express";
import { PushSubscription } from "../db/models/PushSubscription";
import { sendPushToAll } from "../lib/push";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/vapid-public-key", (_req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY || "";
  res.json({ publicKey: key });
});

router.post("/subscribe", async (req, res) => {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      res.status(400).json({ error: "Invalid subscription object" });
      return;
    }
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: "Subscribed successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to save push subscription");
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      res.status(400).json({ error: "Endpoint required" });
      return;
    }
    await PushSubscription.deleteOne({ endpoint });
    res.json({ message: "Unsubscribed successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to remove push subscription");
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

router.get("/subscriber-count", requireAdmin, async (req, res) => {
  try {
    const count = await PushSubscription.countDocuments();
    res.json({ count });
  } catch (err) {
    req.log.error({ err }, "Failed to get subscriber count");
    res.status(500).json({ error: "Failed to get count" });
  }
});

router.post("/send", requireAdmin, async (req, res) => {
  try {
    const { title, body, url } = req.body;
    if (!title || !body) {
      res.status(400).json({ error: "title and body are required" });
      return;
    }
    const result = await sendPushToAll({ title, body, icon: "/favicon.svg", url: url || "/" });
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to send push notification");
    res.status(500).json({ error: "Failed to send notification" });
  }
});

export default router;
