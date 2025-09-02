import express from "express"
import { signUpUser,signInUser, sendEmailForResetPassword } from "../controller/auth/authController";
const router =  express.Router();

router.post('/sign-up', signUpUser)
router.post('/sign-in', signInUser)
router.post('/reset-password',sendEmailForResetPassword)

export default router;