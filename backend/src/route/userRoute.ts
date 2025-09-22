// User profile and profile update routes. Mounted under /api/v1/user.
import express from "express";
import { getUserDetails, updateUser } from "../controller/user/userController";

const router = express.Router();

router.get("/profile", getUserDetails);
router.post("/update", updateUser);

export default router;
