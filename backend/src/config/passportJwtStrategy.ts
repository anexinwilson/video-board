import dotenv from "dotenv";
import passport from "passport";
import {
  ExtractJwt,
  Strategy as JWTStrategy,
  StrategyOptions,
} from "passport-jwt";
import User from "../model/userSchema";
dotenv.config();
import { Request, RequestHandler } from "express";
import { Types } from "mongoose";

// Custom interface for authenticated requests
// Extends base Express Request to include user data
export interface AuthenticatedRequest extends Request {
  user: {
    _id: Types.ObjectId;
  };
}

// Type for request handlers that require authentication
export type AuthenticatedRequestHandler = RequestHandler<
  any,
  any,
  any,
  any,
  AuthenticatedRequest
>;

// JWT strategy configuration options
const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY as string,
};

// Configure passport to use JWT strategy
passport.use(
  new JWTStrategy(opts, async (jwtPayload, done) => {
    try {
      // Find user by ID from JWT payload, exclude password
      const user = await User.findById(jwtPayload._id).select("-password");
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      console.log(`Error in jwt authentication ${error}`);
      return done(error);
    }
  })
);

export default passport;
