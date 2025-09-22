// Multer S3 storage for handling video and thumbnail uploads.
// Files are uploaded directly to S3 under the VideoBoard/ prefix.
import path from "path";
import dotenv from "dotenv";
dotenv.config();

import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    // Prefer IAM role in Lambda. These env keys are fine for local dev.
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME as string,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "private",
    metadata: function (_req, file, cb) {
      cb(null, { fieldname: file.fieldname });
    },
    key: function (_req, file, cb) {
      const folder = "VideoBoard";
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension);
      const fileName = `${baseName}-${Date.now()}-${file.fieldname}${extension}`;
      const filePath = `${folder}/${fileName}`;
      cb(null, filePath);
    },
  }),
}).fields([
  { name: "video", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);
