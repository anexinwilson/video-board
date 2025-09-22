// Routes that mutate or fetch the authenticated user's videos.
// Mounted under / (with JWT) in the main router configuration.
import express from "express";
import { upload } from "../middleware/multerS3Middleware";
import {
  deleteVideoById,
  fetchUserVideos,
  fetchVideoById,
  fetchVideos,
  updateVideoById,
  uploadFile,
} from "../controller/aws/awsFileController";

const router = express.Router();

// Upload new video and optional thumbnail
router.post("/videos", upload, uploadFile);

// Resource by id
router.get("/video/:id", fetchVideoById);
router.delete("/video/:id", deleteVideoById);
router.put("/video/:id", upload, updateVideoById);

// Current user's videos
router.get("/videos", fetchUserVideos);

export default router;
