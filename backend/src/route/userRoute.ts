import express from 'express'
import { getUserDetails } from '../controller/user/userController'
const router = express.Router()

router.get('/profile',getUserDetails)

export default router