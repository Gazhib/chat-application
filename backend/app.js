const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const bcrypt = require("bcryptjs");
const http = require("http");
const { initSocket } = require("./socket");
const { messageModel, chatModel, userModel } = require("./models");
const { default: mongoose } = require("mongoose");
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
const db = process.env.DB_CONNECTION;

const connectDb = async () => {
  await mongoose.connect(db);
  console.log("Connected to db");
};

connectDb();

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

app.post("/send-message", async (req, res) => {
  const { chatId, senderId, cipher, meta } = req.body;
  // const createdAt = Date.now();
  // const msg = new messageModel({ chatId, cipher, senderId });

  io.to(chatId).emit("message", {
    chatId,
    senderId,
    meta,
  });
  res.status(200).json({ chatId, senderId });
});

app.get("/get-users", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload.sub;
  const users = await userModel
    .find({ _id: { $ne: myId } })
    .select("_id login");
  res.status(200).json(users);
});

app.post("/chats/direct/:directId", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload.sub;
  const otherId = req.params.directId;

  let chat = await chatModel.findOne({
    chatType: "DIRECT",
    membershipIds: { $all: [myId, otherId], $size: 2 },
  });

  if (!chat) {
    const result = new chatModel({
      chatType: "DIRECT",
      membershipIds: [myId, otherId],
      createdAt: Date.now(),
      seq: 0,
      creatorId: myId,
    });

    chat = result;
    await result.save();
  }

  res.status(200).json({ chatId: chat._id.toString() });
});

app.post("/get-messages", tokenMiddleware, async (req, res) => {
  const { directId } = req.body;
  const userId = req.userPayload.sub;

  const chat = await chatModel
    .findById(directId)
    .populate({ path: "messages", options: { limit: 50, sort: { seq: 1 } } })
    .exec();


  if (!chat || !chat.membershipIds.includes(userId)) {
    return res.status(404).json({ message: "Invalid chat" });
  }

  return res.status(200).json(chat);
});

app.get("/me", tokenMiddleware, async (req, res) => {
  const { login, role, email, isVerified } = req.userPayload;
  if (!req.userPayload || !login || !role) {
    res.status(401).json("Unauthorized");
  }
  res.status(200).json({ login, role, email, isVerified });
});

const server = http.createServer(app);

const io = initSocket(server);

server.listen(3000, () => {
  console.log("server started at 3000");
});
