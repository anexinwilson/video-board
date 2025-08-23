import express from "express";
import connectDB from "./config/db";
import dotenv from "dotenv";
import routes from "./route/index";
import passportJwtStrategy from "./config/passportJwtStrategy";

const app = express();

dotenv.config();
connectDB();

app.use(passportJwtStrategy.initialize());

const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", routes);
app.listen(process.env.port, () => {
  console.log(`listening to port ${port}`);
});
