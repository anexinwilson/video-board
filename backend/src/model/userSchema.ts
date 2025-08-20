import mongoose, { Document, Schema, Model } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password: string;
  token?: string;
  uploadCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String },
    uploadCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
  },

  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
