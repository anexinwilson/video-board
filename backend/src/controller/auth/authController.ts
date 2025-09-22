// Auth controller: signup, signin, reset password, update password.
// Uses bcrypt helpers for hashing and JWT for issuing session tokens.
import { Request, RequestHandler } from "express";
import User from "../../model/userSchema";
import { sendResponse } from "../../utils/sendResponse";
import crypto from "crypto";
import {
  compareHashedPassword,
  hashPassword,
} from "../../utils/passwordHelper";
import { generateJwtToken } from "../../utils/generateJwtToken";
import { resetPasswordEmail } from "../../mailer/resetPassword";
import jwt from "jsonwebtoken";

interface RegisterReq extends Request {
  body: {
    email: string;
    password: string;
    username: string;
  };
}

export const signUpUser: RequestHandler = async (req: RegisterReq, res) => {
  try {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
      return sendResponse(res, 400, false, "Email, password, and username are required");
    }

    // Prevent duplicate accounts and usernames
    const [isExistingUser, isExistingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);
    if (isExistingUser) return sendResponse(res, 400, false, "Email already in use");
    if (isExistingUsername) return sendResponse(res, 400, false, "Username already taken");

    // Hash before storing
    const hashedPassword = await hashPassword(password);
    await User.create({
      email,
      username,
      password: hashedPassword,
      token: crypto.randomBytes(12).toString("hex"), // used for reset flows
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

    // Verify account
    const user = await User.findOne({ email });
    if (!user) return sendResponse(res, 404, false, "Account does not exist");

    // Check password
    const matchPassword = await compareHashedPassword(password, user.password);
    if (!matchPassword) return sendResponse(res, 400, false, "Password does not match");

    // Issue JWT token for the client
    const jwtToken = await generateJwtToken(user);
    sendResponse(res, 200, true, "Logged in successfully", {
      user: {
        token: jwtToken,
        _id: user._id,
        email: user.email,
        username: (user as any).username,
        uploadCount: (user as any).uploadCount,
        downloadCount: (user as any).downloadCount,
      },
    });
  } catch (error) {
    console.error(`Authentication failed: ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

export const sendEmailForResetPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendResponse(res, 404, false, "Email not found");

    const user = await User.findOne({ email });
    if (!user) return sendResponse(res, 404, false, "User not found");

    // Short lived reset token embedded in the link
    const secretOrKey = process.env.JWT_SECRET_KEY as string;
    const resetToken = await jwt.sign(
      { id: user._id, email: user.email },
      secretOrKey,
      { expiresIn: "1h" }
    );

    user.token = resetToken;
    await user.save();

    await resetPasswordEmail(user);
    sendResponse(res, 200, true, "Check your mail to reset your password");
  } catch (error) {
    console.error(`Authentication failed: ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

export const updatePassword: RequestHandler = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) return sendResponse(res, 404, false, "Token not found");

    // Find user by stored reset token
    const user = await User.findOne({ token });
    if (!user) return sendResponse(res, 404, false, "User not found");

    // Validate token before updating
    const secretOrKey = process.env.JWT_SECRET_KEY as string;
    try {
      await jwt.verify(token, secretOrKey);
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return sendResponse(res, 400, false, "Reset token has expired");
      }
      return sendResponse(res, 400, false, "Invalid reset token");
    }

    // Persist new password and rotate token
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.token = crypto.randomBytes(12).toString("hex");
    await user.save();

    return sendResponse(res, 200, true, "Updated your password");
  } catch (error) {
    console.error(`Authentication failed: ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};
