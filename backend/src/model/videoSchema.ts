// Video metadata model. Stores S3 key, path, optional thumbnail, and view count.
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IVideo extends Document {
  title?: string;
  description?: string;
  uploadeBy: mongoose.Schema.Types.ObjectId; // note typo preserved if already in DB
  createdAt: Date;
  updatedAt: Date;
  key: string;
  path: string;
  isPrivate: boolean;
  thumbNail?: string;
  viewCount: number;
}

const videoSchema: Schema = new Schema(
  {
    title: { type: String, default: "default title", required: true },
    description: { type: String, default: "Default description" },
    key: { type: String, required: true },
    path: { type: String, required: true },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: { type: Boolean, default: false },
    thumbNail: {
      type: String,
      default:
        "https://static.vecteezy.com/system/resources/thumbnails/005/048/106/small_2x/black-and-yellow-grunge-modern-thumbnail-background-free-vector.jpg",
    },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Video: Model<IVideo> = mongoose.model<IVideo>("Video", videoSchema);
export default Video;
