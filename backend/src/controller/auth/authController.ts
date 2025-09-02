import { Request, RequestHandler } from "express";
import User from "../../model/userSchema";
import { sendResponse } from "../../utils/sendResponse";
import crypto from "crypto";
import {
  compareHashedPassword,
  hashPassword,
} from "../../utils/passwordHelper";
import { send } from "process";
import { generateJwtToken } from "../../utils/generateJwtToken";
import { resetPasswordEmail } from "../../mailer/resetPassword";

interface RegisterReq extends Request {
  body: {
    email: string;
    password: string;
  };
}

export const signUpUser: RequestHandler = async (req: RegisterReq, res) => {
  try {
    const { email, password } = req.body;
    const isExistingUser = await User.findOne({ email });

    if (isExistingUser) {
      return sendResponse(res, 400, false, "User already exists");
    }
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      token: crypto.randomBytes(12).toString("hex"),
    });
    return sendResponse(res, 200, true, "User created successfully");
  } catch (error) {
    console.error(`Error in signing up the user ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

export const signInUser: RequestHandler = async (req: RegisterReq, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, false, "Account does not exist");
    }
    const matchPassword = await compareHashedPassword(password, user.password);
    if (!matchPassword) {
      return sendResponse(res, 400, false, "Password does not match");
    }
    const jwtToken = await generateJwtToken(user);
    sendResponse(res, 200, true, "Logged in successfullly", {
      user: { token: jwtToken },
    });
  } catch (error) {
    console.error(`Authentication failed: ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

export const sendEmailForResetPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendResponse(res, 404, false, "email not found");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return sendResponse(res, 404, false, "user not found");
    }
    await resetPasswordEmail(user);
    sendResponse(res, 200, true, "Check your mail to reset your password");
  } catch (error) {
    console.error(`Authentication failed: ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};
