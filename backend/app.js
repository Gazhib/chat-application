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
app.use(express.json());

const accessSecretKey = process.env.ACCESS_SECRET;
const db = process.env.DB_CONNECTION;

const connectDb = async () => {
  await mongoose.connect(db);
  console.log("Connected to db");
};

connectDb();

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    const { chatId, senderId, cipher, picture, type } = JSON.parse(message);

    const messageType = picture && cipher ? "mix" : picture ? "picture" : "txt";

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
      picture,
      messageType: type ?? messageType,
      picture:
        messageType === "mix" || messageType === "picture"
          ? imageName
          : undefined,
    });

    await newMessage.save();

    newMessage.picture = url;
    console.log(newMessage.messageType, type);

    res.status(200).json(newMessage);
  }
);

app.get("/users", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload?.sub;
  const users = await userModel
    .find({ _id: { $ne: myId } })
    .select("_id login profilePicture")
    .lean();

  const neededUsers = [];

  for (const user of users) {
    neededUsers.push(user);
    user.id = user._id;
    delete user._id;

    const chat = await chatModel.findOne({
      chatType: "DIRECT",
      membershipIds: { $all: [myId, user.id], $size: 2 },
    });

    if (!chat) {
      neededUsers.pop();
      continue;
    }

    const lastMessage = await chat.populate({
      path: "messages",
      options: { sort: { createdAt: -1 }, limit: 1 },
    });
    user.lastMessage = lastMessage.messages[lastMessage.messages.length - 1];
    if (lastMessage.messages.length === 0) {
      neededUsers.pop();
      continue;
    }

    if (user.profilePicture) {
      const url = await getPicture({ imageName: user.profilePicture });
      user.profilePicture = url;
    }

    if (user.lastMessage.picture) {
      const url = await getPicture({ imageName: user.lastMessage.picture });
      user.lastMessage.picture = url;
    }

    user.chatId = chat._id;
  }

  res.status(200).json(neededUsers);
});

app.post("/users/:userName", tokenMiddleware, async (req, res) => {
  const { userName } = req.params;

  const users = await userModel
    .find({
      login: { $regex: userName, $options: "i" },
    })
    .limit(15)
    .lean()
    .select("_id login profilePicture");

  for (const user of users) {
    user.id = user._id;
    delete user._id;

    if (user.profilePicture) {
      const url = await getPicture({ imageName: user.profilePicture });
      user.profilePicture = url;
    }
  }

  return res.status(200).json(users);
});

app.post("/chats/:chatId", tokenMiddleware, async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userPayload?.sub;

  const chat = await chatModel
    .findById(chatId)
    .populate({ path: "messages" })
    .exec();
  if (!chat || (userId && !chat.membershipIds.includes(userId))) {
    return res.status(404).json({ message: "Invalid chat" });
  }

  const membershipIds = chat.membershipIds;

  const companionId = membershipIds.find(
    (id) => id.toString() !== userId?.toString()
  );

  if (companionId) {
    const user = await userModel
      .findOne({ _id: companionId })
      .select("_id login profilePicture email description");
    if (user.profilePicture) {
      const url = await getPicture({ imageName: user.profilePicture });
      user.profilePicture = url;
    }
    user.id = user._id;
    const companion = { ...user._doc, id: user._id };
    delete companion._id;

    for (const message of chat.messages) {
      if (message.messageType === "picture" || message.messageType === "mix") {
        const url = await getPicture({ imageName: message.picture });
        message.picture = url;
      }
    }

    return res.status(200).json({ chat, companion });
  }

  return res.status(400).json("Something went wrong...");
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

app.delete("/messages/:messageId", async (req, res) => {
  const { messageId } = req.params;
  const message = await messageModel.findByIdAndDelete(messageId);
  if (!message) {
    return res.status(400).json("Could not find deleted message");
  }

  return res.status(200).json("Successfully deleted message");
});

app.patch("/user-description", async (req, res) => {
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

app.patch("/profile-picture", upload.single("image"), async (req, res) => {
  const { userId } = req.body;
  const file = req.file;
  const imageName = randomImageName();

  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(400).json("Something went wrong");
  }

  await putPicture({ imageName, file: req });

  user.profilePicture = imageName;

  const url = await getPicture({ imageName });
  await user.save();
  return res.status(200).json({ profilePicture: url });
});

app.get("/me", tokenMiddleware, async (req, res) => {
  const { login, role, email, isVerified, sub, description, profilePicture } =
    req.userPayload || {};
  if (!req.userPayload || !login || !role) {
    res.status(401).json("Unauthorized");
  }
  res.status(200).json({
    id: sub,
    login,
    role,
    email,
    isVerified,
    description,
    profilePicture,
  });
});

const port = process.env.DF_PORT;

server.listen(port, () => {
  console.log(`server started at ${port}`);
});
