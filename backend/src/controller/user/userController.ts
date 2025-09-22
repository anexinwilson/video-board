// User profile and update endpoints for authenticated users.
// Uses passport-jwt to populate req.user.
import { send } from "process";
import { AuthenticatedRequestHandler } from "../../config/passportJwtStrategy";
import User from "../../model/userSchema";
import { sendResponse } from "../../utils/sendResponse";

export const getUserDetails: AuthenticatedRequestHandler = async (req, res) => {
  try {
    // Support both hydrated User instances and plain objects on req.user
    if (req.user instanceof User) {
      const userId = req.user._id;
      if (!userId) return sendResponse(res, 400, false, "Please sign in to continue");

      const user = await User.findById(userId).select("-password");
      if (!user) return sendResponse(res, 404, false, "User not found");
      sendResponse(res, 200, true, "User details fetched successfully", { user });
    } else {
      const userId = (req.user as any)?._id;
      if (!userId) return sendResponse(res, 400, false, "Please sign in to continue");

      const user = await User.findById(userId).select("-password");
      if (!user) return sendResponse(res, 404, false, "User not found");
      sendResponse(res, 200, true, "User details fetched successfully", { user });
    }
  } catch (error) {
    console.error(`Error in sending user details ${error}`);
    sendResponse(res, 500, false, "Internal server Error");
  }
};

export const updateUser: AuthenticatedRequestHandler = async (req, res) => {
  try {
    const { username, email } = req.body as { username: string; email: string };

    // Minimal validation here. Add stricter checks in production if needed.
    if (!username) return sendResponse(res, 400, false, "Username is required");
    if (!email) return sendResponse(res, 400, false, "Email is required");

    if (req.user instanceof User) {
      const userId = req.user._id;
      if (!userId) return sendResponse(res, 404, false, "User is not found");

      // Enforce uniqueness
      const usernameTaken = await User.findOne({ username, _id: { $ne: userId } });
      if (usernameTaken) return sendResponse(res, 400, false, "Username already taken");

      const emailTaken = await User.findOne({ email, _id: { $ne: userId } });
      if (emailTaken) return sendResponse(res, 400, false, "Email already in use");

      const user = await User.findByIdAndUpdate(
        userId,
        { username, email },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) return sendResponse(res, 404, false, "User not found");
      sendResponse(res, 200, true, "Successfully updated your details", { user });
    } else {
      // Same flow when req.user is a plain object
      const userId = (req.user as any)?._id;
      if (!userId) return sendResponse(res, 404, false, "User is not found");

      const usernameTaken = await User.findOne({ username, _id: { $ne: userId } });
      if (usernameTaken) return sendResponse(res, 400, false, "Username already taken");

      const emailTaken = await User.findOne({ email, _id: { $ne: userId } });
      if (emailTaken) return sendResponse(res, 400, false, "Email already in use");

      const user = await User.findByIdAndUpdate(
        userId,
        { username, email },
        { new: true, runValidators: true }
      ).select("-password");

      if (!user) return sendResponse(res, 404, false, "User not found");
      sendResponse(res, 200, true, "Successfully updated your details", { user });
    }
  } catch (error) {
    console.error(`Error in updating user ${error}`);
    sendResponse(res, 500, false, "Internal server error");
  }
};
