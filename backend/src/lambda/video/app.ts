// Video Lambda Express app. Public endpoints for listing and viewing,
// protected endpoints for updating, deleting, and presigning uploads.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "../../config/db";
import passport from "../../config/passportJwtStrategy";
import {
  fetchVideos,
  fetchVideoById,
  updateVideoById,
  deleteVideoById,
  trackVideoView,
  trackVideoDownload,
} from "../../controller/aws/awsFileController";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Request, Response } from "express";

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_BUCKET_NAME;
const s3 = new S3Client({ region: REGION });

connectDB();

const app = express();

app.use(cors({ origin: [process.env.FRONTEND_URL!] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const api = express.Router();

// Public endpoints
api.get("/videos", fetchVideos);
api.get("/video/:id", fetchVideoById);
api.post("/video/:id/track-view", trackVideoView);
api.post("/video/:id/track-download", trackVideoDownload);

// Protected endpoints
api.put("/video/:id", passport.authenticate("jwt", { session: false }), updateVideoById);
api.delete("/video/:id", passport.authenticate("jwt", { session: false }), deleteVideoById);

// Returns a short-lived presigned URL for direct uploads to S3
api.get("/upload/presign", passport.authenticate("jwt", { session: false }), async (_req: Request, res: Response) => {
  try {
    if (!BUCKET) return res.status(500).send("S3 bucket not configured");

    const key = `VideoBoard/${Date.now()}-${Math.random().toString(36).slice(2)}.bin`;
    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ACL: "private",
      ContentType: "application/octet-stream",
    });

    const url = await getSignedUrl(s3, cmd, { expiresIn: 60 });
    res.json({ url, key });
  } catch (e: any) {
    res.status(500).send(e?.message || "Internal error");
  }
});

// API Gateway forwards to /api/v1/*
app.use("/api/v1", api);

export default app;
