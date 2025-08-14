const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();

const multer = require("multer");
const http = require("http");
const { initSocket } = require("./socket");
const { messageModel, chatModel, userModel } = require("./models");
const { default: mongoose } = require("mongoose");
require("dotenv").config({ path: "../.env" });
const { getPicture, putPicture } = require("./bucket");
const { unescape } = require("querystring");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      `${process.env.AUTH_PORT}`,
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

const accessSecretKey = process.env.ACCESS_SECRET;
const db = process.env.DB_CONNECTION;

const connectDb = async () => {
  await mongoose.connect(db);

  console.log("Connected to db");
};

connectDb();

const MB = 1024 * 1024;
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * MB },
  fileFilter: (req, file, cb) =>
    cb(null, ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype)),
});

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

initSocket(server);

app.post(
  "/messages",
  tokenMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { message } = req.body;
    const { chatId, cipher, picture } = JSON.parse(message);
    const senderId = req.userPayload.sub;

    const messageType = picture && cipher ? "mix" : picture ? "picture" : "txt";
    const chat = await chatModel.findOne({
      _id: chatId,
      membershipIds: senderId,
    });

    if (messageType !== "txt" && !req.file) {
      return res.status(400).json("Write a text or have a picture");
    }

    if (!chat) {
      return res.status(403).json("You are not a member of this chat");
    }
    let url = null;

    const imageName = randomImageName();
    if (messageType === "mix" || messageType === "picture") {
      const file = req.file;
      await putPicture({ file, imageName });
      url = await getPicture({ imageName });
    }

    const newMessage = new messageModel({
      chatId,
      senderId,
      cipher,
      messageType: messageType,
      picture: messageType !== "txt" ? imageName : undefined,
    });

    await newMessage.save();

    newMessage.picture = url;

    res.status(200).json(newMessage);
  }
);

app.get("/users", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload?.sub;
  const chats = await chatModel.find({ membershipIds: myId }).lean();
  const userIds = chats.map((chat) =>
    chat.membershipIds.find((id) => id.toString() !== myId.toString())
  );
  const chatIds = chats.map((chat) => chat._id);

  const chatIdByUser = new Map();
  for (const chat of chats) {
    console.log(chat);
    const chatId = chat._id.toString();
    const companionId = chat.membershipIds
      .find((id) => id.toString() !== myId.toString())
      .toString();
    chatIdByUser.set(companionId, chatId);
  }

  const lastMessages = await messageModel.aggregate([
    {
      $match: { chatId: { $in: chatIds } },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $group: {
        _id: "$chatId",
        lastMessage: { $first: "$$ROOT" },
      },
    },
  ]);

  const lastMessagesByChat = new Map(
    lastMessages.map((message) => [message._id.toString(), message.lastMessage])
  );

  const users = await userModel
    .find({ _id: { $in: userIds } })
    .select("_id login profilePicture");

  for (const user of users) {
    const chatId = chatIdByUser.get(user._id.toString());
    user.lastMessage = lastMessagesByChat.get(chatId);
    if (
      user.lastMessage &&
      user.lastMessage.messageType !== "txt" &&
      user.lastMessage.picture
    ) {
      user.lastMessage.picture = await getPicture({
        imageName: user.lastMessage.picture,
      });
    }
    if (user.profilePicture) {
      const url = await getPicture({ imageName: user.profilePicture });
      user.profilePicture = url;
    }
    user.chatId = chatIdByUser.get(user._id.toString());
  }

  console.log(users);

  return res.status(200).json(users);
});

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

app.post("/users/:userName", tokenMiddleware, async (req, res) => {
  const { userName } = req.params;
  const q = escapeRegex(userName);

  const users = await userModel
    .find({
      login: { $regex: `${q}`, $options: "i" },
    })
    .limit(15)
    .lean()
    .select("_id login profilePicture");

  for (const user of users) {
    if (user.profilePicture) {
      const url = await getPicture({ imageName: user.profilePicture });
      user.profilePicture = url;
    }
  }

  return res.status(200).json(users);
});

const clamp = (value, min, max) => {
  return Math.max(min, Math.min(value, max));
};

app.post("/chats", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload.sub;
  const { companionId } = req.body;

  const newChat = new chatModel({
    membershipIds: [myId, companionId],
    creatorId: myId,
    chatType: "DIRECT",
  });
  await newChat.save();
  return res.status(200).json(newChat);
});

app.get("/chats/:chatId/messages", tokenMiddleware, async (req, res) => {
  const { chatId } = req.params;
  const myId = req.userPayload.sub;
  try {
    const limit = clamp(req.query.limit, 1, 100);
    const cursor = req.query.beforeId;

    const chat = await chatModel.findOne({ membershipIds: myId });
    if (!chat) return res.status(403).json("Not your chat");
    const companionId = chat.membershipIds.find(
      (id) => id.toString() !== myId.toString()
    );
    const companion = await userModel.findById(companionId);

    const q = { chatId };

    if (cursor) q._id = { $lt: cursor };
    const messages = await messageModel
      .find(q)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    const nextCursor = messages.length
      ? messages[messages.length - 1]._id
      : null;

    for (const message of messages) {
      if (message.messageType === "picture" || message.messageType === "mix") {
        const url = await getPicture({ imageName: message.picture });
        message.picture = url;
      }
    }
    if (companion.profilePicture) {
      const url = await getPicture({ imageName: companion.profilePicture });
      companion.profilePicture = url;
    }

    return res.status(200).json({ nextCursor, messages, companion });
  } catch (e) {
    return res.status(400).json(e || "Something went wrong...");
  }
});

app.post("/public-key", tokenMiddleware, async (req, res) => {
  const { publicKey } = req.body;
  const userId = req.userPayload?.sub;

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
  const { chatId } = req.body;
  const myId = req.userPayload.sub;
  const chat = await chatModel.findOne({ _id: chatId, membershipIds: myId });
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

app.delete("/messages/:messageId", tokenMiddleware, async (req, res) => {
  const { messageId } = req.params;
  const message = await messageModel.findByIdAndDelete(messageId);
  if (!message) {
    return res.status(400).json("Could not find deleted message");
  }

  return res.status(200).json("Successfully deleted message");
});

app.patch("/user-description", tokenMiddleware, async (req, res) => {
  const { userId, description } = req.body;
  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(400).json("Could not find user");
  }

  user.description = description;
  await user.save();

  return res.status(200).json("Description changed successfully");
});

const randomImageName = () => {
  return crypto.randomUUID().toString();
};

app.patch(
  "/profile-picture",
  tokenMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { userId } = req.body;
    const file = req.file;
    const imageName = randomImageName();

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json("Something went wrong");
    }

    await putPicture({ imageName, file });

    user.profilePicture = imageName;

    const url = await getPicture({ imageName });
    await user.save();
    return res.status(200).json({ profilePicture: url });
  }
);

app.get("/me", tokenMiddleware, async (req, res) => {
  const { login, role, email, sub } = req.userPayload || {};
  if (!req.userPayload || !login || !role) {
    res.status(401).json({ error: "Unauthorized" });
  }

  const user = await userModel
    .findById(sub)
    .select("profilePicture description isVerified")
    .lean();
  let url = null;
  if (user.profilePicture) {
    url = await getPicture({ imageName: user.profilePicture });
  }

  res.status(200).json({
    _id: sub,
    login,
    role,
    email,
    isVerified: user.isVerified,
    description: user.description,
    profilePicture: url,
  });
});

const port = process.env.DF_PORT;

server.listen(port, () => {
  console.log(`server started at ${port}`);
});
