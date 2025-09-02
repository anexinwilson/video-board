import { transporter } from "../config/nodemailer";
import { IUser } from "../model/userSchema";
import dotenv from "dotenv";

dotenv.config();

export const resetPasswordEmail = async (user: IUser) => {
  try {
    const options = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reset your password",
      html: "<h1> reset password mail </h1>",
    };
    await transporter.sendMail(options);
  } catch (error) {
    console.error(`Error in sending reset password to mail ${error}`);
  }
};
