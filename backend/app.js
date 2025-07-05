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

const server = http.createServer(app);

const io = initSocket(server);

app.post("/send-message", tokenMiddleware, async (req, res) => {
  const { chatId, senderId, cipher } = req.body;

  const newMessage = new messageModel({
    chatId,
    senderId,
    cipher,
  });

  newMessage.save();

  res.status(200).json({ chatId, senderId, cipher });
});

app.get("/get-users", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload.sub;
  const users = await userModel
    .find({ _id: { $ne: myId } })
    .select("_id login");

  res.status(200).json(users);
});

app.post("/chats/:chatId", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload.sub;
  const otherId = req.params.chatId;

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

app.post("/get-chat-info", tokenMiddleware, async (req, res) => {
  const { chatId } = req.body;
  const userId = req.userPayload.sub;

  const chat = await chatModel
    .findById(chatId)
    .populate({ path: "messages", options: { limit: 50, sort: { seq: 1 } } })
    .exec();

  if (!chat || !chat.membershipIds.includes(userId)) {
    return res.status(404).json({ message: "Invalid chat" });
  }

  return res.status(200).json(chat);
});

app.post("/get-companion-info", tokenMiddleware, async (req, res) => {
  const { chatId, myId } = req.body;
  const chat = await chatModel.findById(chatId);

  if (!chat || !chat.membershipIds.includes(myId)) {
    return res.status(404).json({ message: "Invalid chat" });
  }

  const membershipIds = chat.membershipIds;

  const companionId = membershipIds.find(
    (id) => id.toString() !== myId.toString()
  );

  if (companionId) {
    const user = await userModel
      .findOne({ _id: companionId })
      .select("_id login");
    return res.status(200).json(user);
  }

  return res.status(400).json("Something went wrong...");
});

app.post("/public-key", tokenMiddleware, async (req, res) => {
  const { publicKey } = req.body;
  const userId = req.userPayload.sub;

  const user = await userModel.findById(userId);
  if (!user) {
    return res
      .status(400)
      .json("Something went wrong... Could not find the user");
  }

  user.publicKey = publicKey;
  await user.save();
  return res.status(200).json("Public key is saved");
});

app.post("/peer-public-key", tokenMiddleware, async (req, res) => {
  const { chatId, myId } = req.body;
  const chat = await chatModel.findById(chatId);
  if (!chat) {
    return res
      .status(400)
      .json("Something went wrong... Could not find the user");
  }

  const membershipIds = chat.membershipIds;

  const userId = membershipIds.find((id) => id.toString() !== myId.toString());
  const user = await userModel.findById(userId);
  if (!user || !user.publicKey) {
    return res
      .status(400)
      .json("Something went wrong... Could not find the user");
  }

  return res.status(200).json({ publicKey: user.publicKey });
});

app.get("/me", tokenMiddleware, async (req, res) => {
  const { login, role, email, isVerified, sub } = req.userPayload;
  if (!req.userPayload || !login || !role) {
    res.status(401).json("Unauthorized");
  }
  res.status(200).json({ id: sub, login, role, email, isVerified });
});

server.listen(3000, () => {
  console.log("server started at 3000");
});
