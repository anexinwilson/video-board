import express from 'express'
import { getUserDetails, updateUser } from '../controller/user/userController'
const router = express.Router()

router.get('/profile',getUserDetails)
router.post("/update",updateUser)

export default router