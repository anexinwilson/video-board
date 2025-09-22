// Auth Lambda Express app. Mounts only auth routes under /api/v1.
// This keeps the container focused and cold starts small.
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "../../config/db";
import {
  signUpUser,
  signInUser,
  sendEmailForResetPassword,
  updatePassword,
} from "../../controller/auth/authController";

connectDB(); // connect once per cold start

const app = express();

app.use(cors({ origin: [process.env.FRONTEND_URL!] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const api = express.Router();

api.post("/auth/sign-up", signUpUser);
api.post("/auth/sign-in", signInUser);
api.post("/auth/reset-password", sendEmailForResetPassword);
api.post("/auth/update-password/:token", updatePassword);

// API Gateway sends traffic to /api/v1/*
app.use("/api/v1", api);

export default app;
