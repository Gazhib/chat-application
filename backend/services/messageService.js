const { AppError } = require("../middleware/error");
const { messageRepository, chatRepository } = require("../repositories");
const { idsEqual, hasMembership } = require("../utils/ids");
const { isBase64String } = require("../utils/validation");
const { uploadPicture, getPictureUrl } = require("./storageService");

const VALID_ENC_VERSIONS = [1];

const parseMessagePayload = (raw) => {
  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError(400, "Invalid message payload");
  }
};

const validateCipher = (cipher) => {
  if (!cipher) return;
  if (!cipher.iv || !cipher.data) {
    throw new AppError(400, "Invalid cipher: missing iv or data");
  }
  if (!isBase64String(cipher.iv) || !isBase64String(cipher.data)) {
    throw new AppError(400, "Invalid cipher: iv/data must be base64");
  }
};

const resolveMessageType = ({ type, picture, cipher }) => {
  if (type === "call") return "call";
  if (picture && cipher) return "mix";
  if (picture) return "picture";
  return "txt";
};

const createMessage = async ({ senderId, body, file }) => {
  const { message, type } = body;
  const parsed = parseMessagePayload(message);

  const { chatId, cipher, picture, roomId, encVersion: rawEncVersion } = parsed;
  const encVersionSource = body.encVersion ?? rawEncVersion ?? 1;
  const encVersion = Number.parseInt(encVersionSource, 10);

  validateCipher(cipher);

  if (!VALID_ENC_VERSIONS.includes(encVersion)) {
    throw new AppError(400, "Unsupported encVersion");
  }

  const messageType = resolveMessageType({ type, picture, cipher });

  const chat = await chatRepository.findById(chatId);

  if (messageType !== "txt" && !file && messageType !== "call") {
    throw new AppError(400, "Write a text or have a picture");
  }

  if (!chat || !hasMembership(chat, senderId)) {
    throw new AppError(403, "You are not a member of this chat");
  }

  let imageName = null;
  let url = null;
  if (messageType === "mix" || messageType === "picture") {
    imageName = await uploadPicture(file);
    url = await getPictureUrl(imageName);
  }

  const newMessage = await messageRepository.create({
    chatId,
    senderId,
    messageType,
    cipher,
    encVersion,
    picture: imageName,
    roomId: type === "call" ? roomId : null,
  });

  newMessage.picture = url;
  return newMessage;
};

const markMessageRead = async (messageId, userId) => {
  const message = await messageRepository.findById(messageId);
  if (!message) throw new AppError(404, "Message not found");

  const chat = await chatRepository.findById(message.chatId);
  if (!chat || !hasMembership(chat, userId)) {
    throw new AppError(403, "Not your chat");
  }

  if (idsEqual(message.senderId, userId)) {
    throw new AppError(403, "Cannot mark own message as read");
  }

  const updated = await messageRepository.markRead(messageId);
  updated.encVersion = updated.encVersion ?? 1;
  return updated;
};

const deleteMessage = async (messageId, userId) => {
  const message = await messageRepository.findById(messageId);
  if (!message) throw new AppError(404, "Message not found");
  if (!idsEqual(message.senderId, userId)) {
    throw new AppError(403, "Not your message");
  }
  await messageRepository.deleteById(messageId);
};

module.exports = { createMessage, markMessageRead, deleteMessage };
