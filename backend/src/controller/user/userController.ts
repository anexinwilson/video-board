import { send } from "process";
import { AuthenticatedRequestHandler } from "../../config/passportJwtStrategy";
import User from "../../model/userSchema";
import { sendResponse } from "../../utils/sendResponse";

export const getUserDetails: AuthenticatedRequestHandler = async (req, res) => {
  try {
    if (req.user instanceof User) {
      const userId = req.user._id;
      if (!userId) {
        return sendResponse(res, 400, false, "Please sign in to continue");
      }
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return sendResponse(res, 404, false, "User not found");
      }
      sendResponse(res, 200, true, "User details not found", { user });
    }
  } catch (error) {
    console.error(`Error in sending user details ${error}`);
    sendResponse(res, 500, false, "Internal server Error");
  }
};

export const updateUser : AuthenticatedRequestHandler = async(req,res) => {

  try {
    const {name,email} = req.body
    if(!name) {
      return sendResponse(res,400,false,"Name is required")
    }
    if(req.user instanceof User) {
      const userId = req.user._id
      if(!userId) {
        return sendResponse(res,404,false,"User is not found")
      }
      const user = await User.findByIdAndUpdate(userId,{name,email})
      if(!user) {
        return sendResponse(res,404,false,"User not found")
      }
      sendResponse(res,200,true,"Successfully updated your details",{name,email})
    }

  } catch(error) {
    console.error(`Error in updating user ${error}`)
    sendResponse(res,500,false,"Internal server error")
  }
}