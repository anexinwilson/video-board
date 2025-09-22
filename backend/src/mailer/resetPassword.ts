// Sends a reset-password email using an EJS template.
// The template includes a link with the short-lived reset token.
import { transporter } from "../config/nodemailer";
import { IUser } from "../model/userSchema";
import dotenv from "dotenv";
import ejs from "ejs";
import path from "path";

dotenv.config();

export const resetPasswordEmail = async (user: IUser) => {
  try {
    const emailHtml = await ejs.renderFile(
      path.join(__dirname, "../view/resetEmail.ejs"),
      { token: user.token, frontendUrl: process.env.FRONTEND_URL }
    );

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Reset your password",
      html: emailHtml,
    });
  } catch (error) {
    console.error(`Error in sending reset password to mail ${error}`);
  }
};
