import jwt from "jsonwebtoken";
import { IUser } from "../model/userSchema";
import dotenv from "dotenv";
dotenv.config();

export const generateJwtToken = async (user: IUser): Promise<string> => {
  const secretOrKey = process.env.JWT_SECRET_KEY as string;
  const jwtToken = await jwt.sign(user.toJSON(), secretOrKey, {
    expiresIn: "1d",
  });
  return jwtToken;
};
