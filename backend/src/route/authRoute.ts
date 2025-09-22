// Routes for auth flows. Mounted under /api/v1/auth in Lambda auth app.
import express from "express";
import { signUpUser, signInUser, sendEmailForResetPassword, updatePassword } from "../controller/auth/authController";

const router = express.Router();

router.post("/sign-up", signUpUser);
router.post("/sign-in", signInUser);
router.post("/reset-password", sendEmailForResetPassword);
router.post("/update-password/:token", updatePassword);

export default router;
