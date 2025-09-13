import express from "express";
import { upload } from "../middleware/multerS3Middleware";
import {
  deleteVideoById,
  fetchVideoById,
  fetchVideos,
  updateVideoById,
  uploadFile,
} from "../controller/aws/awsFileController";
const router = express.Router();

router.post("/videos", upload, uploadFile);
router.get("/videos", fetchVideos);
router.get("/video/:id", fetchVideoById);
router.delete("/video/:id", deleteVideoById);
router.put("/video/:id", upload, updateVideoById);

export default router;
