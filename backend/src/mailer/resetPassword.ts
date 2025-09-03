import { transporter } from "../config/nodemailer";
import { IUser } from "../model/userSchema";
import dotenv from "dotenv";
import ejs from "ejs"
import path from "path"

dotenv.config();

export const resetPasswordEmail = async (user: IUser) => {
  try {
    const emailHtml = await ejs.renderFile(path.join(__dirname,"../view/resetEmail.ejs"),{token:user.token})
    const options = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reset your password",
      html: emailHtml,
    };
    await transporter.sendMail(options);
  } catch (error) {
    console.error(`Error in sending reset password to mail ${error}`);
  }
};
