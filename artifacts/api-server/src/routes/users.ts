import { Router } from "express";
import { UserProfile, AVATAR_COLORS } from "../db/models/UserProfile";

const router = Router();

function getColor(ipHash: string): string {
  let hash = 0;
  for (let i = 0; i < ipHash.length; i++) {
    hash = (hash << 5) - hash + ipHash.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

router.post("/profile", async (req, res) => {
  try {
    const { ipHash, displayName } = req.body;
    if (!ipHash) {
      res.status(400).json({ error: "ipHash required" });
      return;
    }

    let profile = await UserProfile.findOne({ ipHash });
    
    if (!profile) {
      const avatarColor = getColor(ipHash);
      const avatarInitials = displayName ? getInitials(displayName) : "?";
      profile = await UserProfile.create({
        ipHash,
        displayName: displayName || "",
        avatarColor,
        avatarInitials,
      });
      res.json({
        ipHash: profile.ipHash,
        displayName: profile.displayName,
        avatarColor: profile.avatarColor,
        avatarInitials: profile.avatarInitials,
        isNew: true,
      });
      return;
    }

    if (displayName && displayName !== profile.displayName) {
      profile.displayName = displayName;
      profile.avatarInitials = getInitials(displayName);
      await profile.save();
    }

    res.json({
      ipHash: profile.ipHash,
      displayName: profile.displayName,
      avatarColor: profile.avatarColor,
      avatarInitials: profile.avatarInitials,
      isNew: false,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get/create user profile");
    res.status(500).json({ error: "Failed to process user profile" });
  }
});

export default router;
