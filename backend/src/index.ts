import express from 'express'
const app = express()
import connectDB from './config/db'
import dotenv from 'dotenv'

dotenv.config()
connectDB();

const port = process.env.PORT


app.listen(process.env.port,() => {
    console.log(`listening to port ${port}`)
})