// Centralized MongoDB connection helper.
// Called once during cold start in Lambda or at server boot locally.
// Keep connection caching in mind if you add serverless hot re-use later.
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    // Expect MONGO_URI to be set in Lambda or local .env
    const db = await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to DB");
  } catch (error) {
    // Surface connection errors early in logs
    console.error(`Error in connecting to the db ${error}`);
  }
};

export default connectDB;
