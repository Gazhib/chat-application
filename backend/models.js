const { Schema, default: mongoose } = require("mongoose");

const deviceSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  pubKey: {
    type: String,
    required: true,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new Schema({
  chatType: {
    type: String,
    required: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  membershipIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "memberships",
    },
  ],
  seq: Number,
});
chatSchema.virtual("messages", {
  ref: "message",
  localField: "_id",
  foreignField: "chatId",
  justOne: false,
});

chatSchema.set("toObject", { virtuals: true });
chatSchema.set("toJSON", { virtuals: true });

const membershipSchema = new Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chats",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  role: {
    type: String,
    default: "MEMBER",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
  lastReadSeq: Number,
});

const messageSchema = new Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "chats",
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  seq: Number,
  messageType: {
    type: String,
    default: "txt",
  },
  status: {
    delievered: Number,
    read: Number,
  },
  cipher: {
    iv: String,
    data: String,
  },
  picture: String,
});

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  login: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "USER",
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  publicKey: {
    type: String,
  },
  description: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    required: false,
  },
  lastMessage: {
    type: messageSchema,
    required: false,
  },
  verifyCode: String,
  verifyCodeExpires: Date,
});

const userModel = mongoose.model("user", userSchema);
const deviceModel = mongoose.model("device", deviceSchema);
const chatModel = mongoose.model("chat", chatSchema);
const membershipModel = mongoose.model("membership", membershipSchema);
const messageModel = mongoose.model("message", messageSchema);

module.exports = {
  userModel,
  deviceModel,
  chatModel,
  membershipModel,
  messageModel,
};
