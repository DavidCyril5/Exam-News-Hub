import webpush from "web-push";
import { PushSubscription } from "../db/models/PushSubscription";
import { logger } from "./logger";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_CONTACT = process.env.ADMIN_EMAIL
  ? `mailto:${process.env.ADMIN_EMAIL}`
  : "mailto:admin@examcorepulse.com";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_CONTACT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
} else {
  logger.warn("VAPID keys not configured — push notifications are disabled");
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  url?: string;
}

export async function sendPushToAll(payload: PushPayload): Promise<{ sent: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    logger.warn("Push notifications skipped — VAPID keys missing");
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await PushSubscription.find({});
  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: sub.keys },
          JSON.stringify(payload)
        );
        sent++;
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          staleEndpoints.push(sub.endpoint);
        } else {
          logger.error({ err, endpoint: sub.endpoint }, "Push send failed");
        }
        failed++;
      }
    })
  );

  if (staleEndpoints.length > 0) {
    await PushSubscription.deleteMany({ endpoint: { $in: staleEndpoints } });
    logger.info({ count: staleEndpoints.length }, "Removed stale push subscriptions");
  }

  return { sent, failed };
}
