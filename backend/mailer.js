import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config({
  path: "../.env"
})
const gmailUser = process.env.GMAIL_USER;

const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;


export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailAppPassword,
  },
});
