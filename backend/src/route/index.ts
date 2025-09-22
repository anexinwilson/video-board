// Aggregates public and protected routes. Mounted under /api/v1 in server.ts.
// Public: list videos and track metrics. Protected: user and upload routes.
import express from "express";
import authRoute from "./authRoute";
import passport from "passport";
import userRoute from "./userRoute";
import awsRoute from "./awsFileRoute";
import { fetchVideos, trackVideoDownload, trackVideoView } from "../controller/aws/awsFileController";

const router = express.Router();

// Public feeds
router.get("/videos", fetchVideos);

// Lightweight analytics
router.post("/video/:id/track-download", trackVideoDownload);
router.post("/video/:id/track-view", trackVideoView);

// Auth routes
router.use("/auth", authRoute);

// Protected user routes
router.use(
  "/user/",
  passport.authenticate("jwt", { session: false }),
  userRoute
);

// Protected upload and owner video routes
router.use("/", passport.authenticate("jwt", { session: false }), awsRoute);

export default router;
