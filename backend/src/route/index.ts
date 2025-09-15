import express from "express";
import authRoute from "./authRoute";
import passport from "passport";
import userRoute from "./userRoute";
import awsRoute from "./awsFileRoute";
import { downloadVideoById, fetchVideos } from "../controller/aws/awsFileController";

const router = express.Router();

router.get("/videos", fetchVideos);
router.get("/video/:id/download", downloadVideoById);
router.use("/auth", authRoute);
router.use(
  "/user/",
  passport.authenticate("jwt", { session: false }),
  userRoute
);
router.use("/aws", passport.authenticate("jwt", { session: false }), awsRoute);

export default router;
