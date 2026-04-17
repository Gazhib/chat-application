const { AppError } = require("../middleware/error");
const { userRepository, chatRepository } = require("../repositories");
const { idsEqual, hasMembership } = require("../utils/ids");
const { isBase64String } = require("../utils/validation");
const { takePublicKeyUpdateSlot } = require("../utils/rateLimit");

const PUBLIC_KEY_BASE64_LENGTH = 88;

const updatePublicKey = async (userId, publicKey) => {
  if (
    !isBase64String(publicKey) ||
    publicKey.length !== PUBLIC_KEY_BASE64_LENGTH
  ) {
    throw new AppError(400, "Invalid public key format");
  }

  const user = await userRepository.findById(userId);
  if (!user) throw new AppError(404, "User not found");

  if (user.publicKey === publicKey) {
    return { keyVersion: user.keyVersion ?? 0 };
  }

  if (!takePublicKeyUpdateSlot(userId)) {
    throw new AppError(429, "Too many public key updates");
  }

  const updated = await userRepository.updateById(userId, {
    publicKey,
    keyVersion: (user.keyVersion ?? 0) + 1,
    keyUpdatedAt: new Date(),
  });

  return { keyVersion: updated.keyVersion };
};

const getPeerPublicKey = async (chatId, userId) => {
  const chat = await chatRepository.findById(chatId);
  if (!chat || !hasMembership(chat, userId)) {
    throw new AppError(400, "Not your chat");
  }

  const companionId = chat.membershipIds.find((id) => !idsEqual(id, userId));
  const companion = await userRepository.findById(companionId);

  if (!companion?.publicKey) throw new AppError(404, "Public key not found");

  return {
    publicKey: companion.publicKey,
    keyVersion: companion.keyVersion ?? 0,
  };
};

module.exports = { updatePublicKey, getPeerPublicKey };
