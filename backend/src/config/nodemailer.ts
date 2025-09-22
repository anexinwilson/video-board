// Nodemailer transport used for password reset emails.
// In production, use an app-specific password for Gmail or a dedicated SMTP provider.
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587, // STARTTLS
  secure: false,
  auth: {
    user: process.env.EMAIL as string,
    pass: process.env.EMAIL_PASS,
  },
});
