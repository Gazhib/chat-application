const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const { userModel } = require("./models");
const { default: mongoose } = require("mongoose");
const { transporter } = require("./mailer");
require("dotenv").config({ path: "../.env" });
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

const accessSecretKey = process.env.ACCESS_SECRET;
const refreshSecretKey = process.env.REFRESH_SECRET;
const db = process.env.DB_CONNECTION;

const connectDb = async () => {
  await mongoose.connect(db);
  console.log("Connected to db");
};

connectDb();

const hashPassword = async (password) => {
  const saltRounds = 15;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, accessSecretKey, { expiresIn: "15m" });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, refreshSecretKey);
};

const trimmerCheck = (word) => {
  if (word.trim() !== word) return false;
  return true;
};

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;

  if (!trimmerCheck(login))
    return res.status(400).json("Login can not contain spaces");
  if (!trimmerCheck(password))
    return res.status(400).json("Password can not contain spaces");

  if (login.trim().length === 0)
    return res.status(400).json("Login can not be empty");

  if (password.trim().length === 0)
    return res.status(400).json("Password can not be empty");

  const user = await userModel.findOne({ login });

  if (!user) return res.status(400).json("No user with that login");

  const hashedPassword = user.password;

  const isCorrectPassword = await bcrypt.compare(password, hashedPassword);
  if (!isCorrectPassword) return res.status(401).json("Incorrect password");
  const role = "user";
  const userPayload = {
    login,
    role,
    email: user.email,
    isVerified: user.isVerified,
    sub: user._id.toString(),
  };

  const accessToken = createAccessToken(userPayload);

  const refreshToken = createRefreshToken(userPayload);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600000,
  });

  res.status(200).json("Logged in");
});

app.post("/api/registration", async (req, res) => {
  const { login, password, confirmPassword, email } = req.body;
  if (!trimmerCheck(login))
    return res.status(400).json("Login can not contain spaces");
  if (!trimmerCheck(password))
    return res.status(400).json("Password can not contain spaces");

  if (login.trim().length === 0)
    return res.status(400).json("Login can not be empty");

  if (password.trim().length === 0)
    return res.status(400).json("Password can not be empty");

  if (password !== confirmPassword)
    return res.status(400).json("Passwords do not match");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json("Invalid email");

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(login))
    return res
      .status(400)
      .json("Login length must be from 3 to 20 and no special characters");

  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(password))
    return res
      .status(400)
      .json(
        "Password length is at least 8 characters, with at least 1 number and 1 letter"
      );

  const isUser = await userModel.findOne({ login });

  if (isUser)
    return res.status(400).json("User with that login already exists");

  const isEmail = await userModel.findOne({ email });

  if (isEmail)
    return res.status(400).json("User with that Email already exists");

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expires = Date.now() + 15 * 60_000;

  const hashedPassword = await hashPassword(password);

  const role = "user";

  const newUser = new userModel({
    login,
    role,
    email,
    password: hashedPassword,
    verifyCode: code,
    verifyCodeExpires: expires,
  });

  await newUser.save();

  await transporter.sendMail({
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${code}`,
  });

  res.status(201).json("Check your email for the code");
});

app.post("/api/verify-email", async (req, res) => {
  const { email, verifyCode } = req.body;
  const user = await userModel.findOne({ email, verifyCode });
  console.log(user);
  if (!user || user.verifyCodeExpires < Date.now()) {
    if (user) await userModel.deleteOne({ email });

    return res.status(400).json("Expired or invalid verification code");
  }

  user.isVerified = true;
  user.verifyCode = undefined;
  user.verifyCodeExpires = undefined;
  await user.save();
  res.status(200).json("Email is verified, please login again");
});

app.get("/api/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const payload = jwt.verify(refreshToken, refreshSecretKey);
  const newAccessToken = jwt.sign(payload, accessSecretKey, {
    expiresIn: "15m",
  });
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600000,
  });
});

app.listen(4000, () => {
  console.log("Auth server started at 4000");
});
