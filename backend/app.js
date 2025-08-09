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
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
require("dotenv").config({ path: "../.env" });
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const BUCKET_NAME = process.env.BUCKET_NAME;
const BUCKET_REGION = process.env.BUCKET_REGION;
const BUCKET_ACCESS_KEY = process.env.BUCKET_ACCESS_KEY;
const BUCKET_SECRET_ACCESS_KEY = process.env.BUCKET_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: BUCKET_ACCESS_KEY,
    secretAccessKey: BUCKET_SECRET_ACCESS_KEY,
  },
  region: BUCKET_REGION,
});

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

const io = initSocket(server);

app.post(
  "/send-message",
  tokenMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { message } = req.body;
    const { chatId, senderId, cipher, picture } = JSON.parse(message);

    const messageType = picture && cipher ? "mix" : picture ? "picture" : "txt";

    let url = null;

    const imageName = randomImageName();
    if (messageType === "mix" || messageType === "picture") {
      const file = req.file.buffer;
      const params = {
        Bucket: BUCKET_NAME,
        Key: imageName,
        Body: file,
        ContentType: req.file.mimetype,
      };

      const putObjectCommand = new PutObjectCommand(params);

      await s3.send(putObjectCommand);

      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: imageName,
      };
      const command = new GetObjectCommand(getObjectParams);
      url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    }

    const newMessage = new messageModel({
      chatId,
      senderId,
      cipher,
      picture,
      messageType,
      picture:
        messageType === "mix" || messageType === "picture"
          ? imageName
          : undefined,
    });

    await newMessage.save();

    newMessage.picture = url;

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
      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: user.profilePicture,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      user.profilePicture = url;
    }

    if (user.lastMessage.picture) {
      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: user.lastMessage.picture,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      user.lastMessage.picture = url;
    }
  }

  res.status(200).json(neededUsers);
});

app.post("/users/:userName", tokenMiddleware, async (req, res) => {
  const userName = req.params.userName;

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
      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: user.profilePicture,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      user.profilePicture = url;
    }
  }

  return res.status(200).json(users);
});

app.post("/chats/:chatId", tokenMiddleware, async (req, res) => {
  const myId = req.userPayload?.sub;
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
      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: user.profilePicture,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      user.profilePicture = url;
    }
    user.id = user._id;
    const companion = { ...user._doc, id: user._id };
    delete companion._id;

    for (const message of chat.messages) {
      if (message.messageType === "picture" || message.messageType === "mix") {
        const getObjectParams = {
          Bucket: BUCKET_NAME,
          Key: message.picture,
        };
        const command = new GetObjectCommand(getObjectParams);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
        message.picture = url;
      }
      console.log(message);
    }

    return res.status(200).json({ chat, companion });
  }

  return res.status(400).json("Something went wrong...");
});

app.post("/get-companion-info", tokenMiddleware, async (req, res) => {
  const { chatId } = req.body;
  console.log(chatId);
  const userId = req.userPayload?.sub;

  const chat = await chatModel.findById(chatId);
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
      const getObjectParams = {
        Bucket: BUCKET_NAME,
        Key: user.profilePicture,
      };
      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      user.profilePicture = url;
    }
    user.id = user._id;
    const companion = { ...user._doc, id: user._id };
    delete companion._id;

    return res.status(200).json({ companion });
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

app.post("/delete-message", async (req, res) => {
  const { messageId } = req.body;
  const message = await messageModel.findByIdAndDelete(messageId);
  console.log(message);
  if (!message) {
    return res.status(400).json("Could not find deleted message");
  }

  return res.status(200).json("Successfully deleted message");
});

app.post("/change-user-description", async (req, res) => {
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

app.post(
  "/update-profile-picture",
  upload.single("image"),
  async (req, res) => {
    const { userId } = req.body;
    const file = req.file.buffer;
    console.log(file);
    const imageName = randomImageName();
    const params = {
      Bucket: BUCKET_NAME,
      Key: imageName,
      Body: file,
      ContentType: req.file.mimetype,
    };

    const putObjectCommand = new PutObjectCommand(params);

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(400).json("Something went wrong");
    }

    await s3.send(putObjectCommand);

    user.profilePicture = imageName;

    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: user.profilePicture,
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    await user.save();
    return res.status(200).json({ profilePicture: url });
  }
);

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
