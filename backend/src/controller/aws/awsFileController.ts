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

export const fetchVideos: RequestHandler = async (req, res) => {
  try {
    const videos = await Video.find({ isPrivate: false })
      .sort({
        createdAt: -1,
      })
      .populate("uploadedBy", "email");
    sendResponse(res, 200, true, "Fetched videos succesfully", { videos });
  } catch (error) {
    console.error(`Error in fetching videos ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};

export const fetchVideoById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, 404, false, "Id not found");
    }
    const video = await Video.findById(id).populate("uploadedBy", "email");
    if (!video) {
      return sendResponse(res, 404, false, "Video not found");
    }
    sendResponse(res, 200, true, "Found your video", { video });
  } catch (error) {
    console.error(`Error in fetching single video ${error}`);
    sendResponse(res, 500, false, "Internal server error");
  }
};

export const deleteVideoById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return sendResponse(res, 404, false, "Id not found");
    }
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      return sendResponse(res, 404, false, "video to be deleted does not exist");
    }
    sendResponse(res, 200, true, "Video deleted succsfully");
  } catch (error) {
    console.error(`Error in deleting the video ${error}`);
    sendResponse(res, 500, false, "Internal server eroor");
  }
};



export const downloadVideoById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    if (!id) {
      return sendResponse(res, 404, false, "Id not found");
    }
    const video = await Video.findById(id);
    if (!video) {
      return sendResponse(res, 404, false, "video not found");
    }
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME as string,
      Key: video.key,
    };
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        user.downloadCount += 1;
        await user.save();
      }
    }
    const command = new GetObjectCommand(params);
    const s3Response = await s3.send(command);
    const stream = s3Response.Body as Readable;
    res.setHeader("Content-Disposition", `attachement;filename=${video.title}`);
    res.setHeader("Content-Type", s3Response.ContentType || "video/mp4");
    stream.pipe(res);
  } catch (error) {
    console.error(`Error in downloading video ${error}`);
    return sendResponse(res, 500, false, "Internal server error");
  }
};