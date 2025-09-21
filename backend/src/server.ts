import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import routes from "./route/index";
import passportJwtStrategy from "./config/passportJwtStrategy";
import cors from "cors";

dotenv.config();
const app = express();
connectDB();

const corsOptions = {
  origin: ["http://localhost:5173"],
};

app.use(cors(corsOptions));
app.use(passportJwtStrategy.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", routes);

const port = process.env.PORT || 8001;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});