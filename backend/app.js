const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "../.env" });
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4000"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

const accessSecretKey = process.env.ACCESS_SECRET;
const refreshSecretKey = process.env.REFRESH_SECRET;

const tokenMiddleware = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Invalid Token");

  jwt.verify(token, accessSecretKey, (err, userPayload) => {
    if (err) {
      console.error(err);
      return res.status(401).json("Invalid or expired token");
    }
    req.userPayload = userPayload;
    next();
  });
};

app.get("/me", tokenMiddleware, async (req, res) => {
  const { login, role } = req.userPayload;
  if (!req.userPayload || !login || !role) {
    res.status(401).json("Unauthorized");
  }
  res.status(200).json({ login, role });
});

app.listen(3000, () => {
  console.log("server started at 3000");
});
