import { Readable } from "stream";
import { RequestHandler } from "express";
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import User from "../../model/userSchema";
import Video from "../../model/videoSchema";
import { sendResponse } from "../../utils/sendResponse";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const uploadFile: RequestHandler = async (req, res) => {
  try {
    if (req.files && (req.files as any).video) {
      let { title, description, isPrivate } = req.body;
      let baseName;
      const videoFile = (req.files as any).video[0];
      const thumbNailFile = (req.files as any).thumbnail
        ? (req.files as any).thumbnail[0]
        : null;

      if (!title) {
        const extension = path.extname(videoFile.originalname);
        baseName = path.basename(videoFile.originalname, extension);
      }
      if (req.user instanceof User) {
        if ("location" in videoFile) {
          if ("key" in videoFile) {
            const newVideo = await Video.create({
              title: title || baseName,
              description: description ? description : undefined,
              uploadedBy: req.user._id,
              path: videoFile.location,
              key: videoFile.key,
              isPrivate,
              thumbNail: thumbNailFile ? thumbNailFile.location : undefined,
            });
            const user = await User.findById(req.user._id);
            if (user) {
              user.uploadCount += 1;
              await user.save();
            }
            return sendResponse(res, 200, true, "Video uploaded successfully", {
              video: {
                _id: newVideo._id,
                path: newVideo.path,
                title: newVideo.title,
                description: newVideo.description,
                thumbNail: newVideo.thumbNail,
                uploadedBy: {
                  email: user?.email,
                },
                isPrivate: newVideo.isPrivate,
              },
            });
          }
          return sendResponse(res, 400, false, "Upload failed");
        }
      }
      return sendResponse(
        res,
        404,
        false,
        "Not authorized to upload the vidoe"
      );
    }
  } catch (error) {
    console.error(`Error in uploading video ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};
