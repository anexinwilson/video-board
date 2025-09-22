// Issues a short-lived JWT for the client. Include only fields needed by the app.
import jwt from "jsonwebtoken";
import { IUser } from "../model/userSchema";
import dotenv from "dotenv";
dotenv.config();

export const generateJwtToken = async (user: IUser): Promise<string> => {
  const secretOrKey = process.env.JWT_SECRET_KEY as string;

  // Consider limiting payload to id/email to keep tokens small.
  const jwtToken = await jwt.sign(user.toJSON(), secretOrKey, {
    expiresIn: "1d",
  });
  return jwtToken;
};
