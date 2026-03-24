import mongoose from "mongoose";
import { logger } from "../lib/logger";

let isConnected = false;

export async function connectMongo() {
  if (isConnected) return;
  
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required");
  }

  try {
    await mongoose.connect(uri);
    isConnected = true;
    logger.info("Connected to MongoDB");
  } catch (err) {
    logger.error({ err }, "Failed to connect to MongoDB");
    throw err;
  }
}

export default mongoose;
