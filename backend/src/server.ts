import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import routes from "./route/index";
import passportJwtStrategy from "./config/passportJwtStrategy";
import cors from "cors";

dotenv.config();
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration for frontend access
const corsOptions = {
  origin: ["http://localhost:5173"], // React development server
};

// Middleware setup
app.use(cors(corsOptions));
app.use(passportJwtStrategy.initialize());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// API routes
app.use("/api/v1", routes);

const port = process.env.PORT || 8001;

// Start server only if not in production (for Vercel deployment)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
}

export default app;