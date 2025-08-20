import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI as string);
    console.log("Connected to DB")
  } catch (error) {
    console.error(`Error in connecting to the db ${error}`);
  }
};

export default connectDB;
