import express from "express";
import { upload } from "../middleware/multerS3Middleware";
import { fetchSingleVideo, fetchVideos, uploadFile } from "../controller/aws/awsFileController";
const router = express.Router();

router.post("/videos", upload, uploadFile);
router.get("/videos", fetchVideos);
router.get("/video/:id", fetchSingleVideo); 

export default router;
