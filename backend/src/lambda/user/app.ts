// User Lambda Express app. Protects user routes with passport-jwt.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "../../config/db";
import passport from "../../config/passportJwtStrategy";
import { getUserDetails, updateUser } from "../../controller/user/userController";
import { fetchUserVideos } from "../../controller/aws/awsFileController";

connectDB();

const app = express();

app.use(cors({ origin: [process.env.FRONTEND_URL!] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

const userRouter = express.Router();
userRouter.get("/profile", getUserDetails);
userRouter.post("/update", updateUser);
userRouter.get("/videos", fetchUserVideos);

// All routes under /api/v1/user are JWT-protected
app.use("/api/v1/user", passport.authenticate("jwt", { session: false }), userRouter);

export default app;
