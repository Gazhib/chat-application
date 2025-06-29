const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcryptjs");
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
// const db = process.env.DB

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

app.post("/api/login", async (req, res) => {
  const { login, password } = req.body;
  // handle validation

  // get password from db

  const gotPassword = password;

  const isCorrectPassword = await bcrypt.compare(gotPassword, password);
  if (!isCorrectPassword) return res.status(401).json("Incorrect password");
  const role = "user"
  const userPayload = {
    login,
    role,
  };

  const accessToken = createAccessToken(userPayload);

  const refreshToken = createRefreshToken(userPayload);

  // add refreshToken to db for further checking

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
  const { login, password, confirmPassword } = req.body;
  // handle validation
  console.log(login)

  if (password !== confirmPassword)
    return res.status(400).json("Passwords do not match");

  const hashedPassword = await hashPassword(password);

  const role = "user"

  const userPayload = {
    login,
    role,
  };

  const accessToken = createAccessToken(userPayload);

  const refreshToken = createRefreshToken(userPayload);

  // add refreshToken to db for further checking

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

  res.status(200).json("Registered in");
});



app.listen(4000, () => {
  console.log("Auth server started at 4000");
});
