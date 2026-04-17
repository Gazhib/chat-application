const { AppError } = require("../middleware/error");
const {
  chatRepository,
  messageRepository,
  userRepository,
} = require("../repositories");
const { idsEqual, hasMembership } = require("../utils/ids");
const { clamp } = require("../utils/validation");
const { getPictureUrl } = require("./storageService");

const createDirectChat = async (userId, companionId) => {
  return chatRepository.create({
    membershipIds: [userId, companionId],
    creatorId: userId,
    chatType: "DIRECT",
  });
};

const getChatMessages = async ({ chatId, userId, beforeId, limitRaw }) => {
  const limit = clamp(limitRaw, 1, 100);

  const chat = await chatRepository.findById(chatId);
  if (!chat || !hasMembership(chat, userId)) {
    throw new AppError(403, "Not your chat");
  }

  const companionId = chat.membershipIds.find((id) => !idsEqual(id, userId));
  const [companion, messages] = await Promise.all([
    userRepository.findById(companionId),
    messageRepository.findByChatPaginated({
      chatId,
      beforeId: beforeId || null,
      limit,
    }),
  ]);

  await Promise.all(
    messages.map(async (message) => {
      message.encVersion = message.encVersion ?? 1;
      if (message.messageType === "picture" || message.messageType === "mix") {
        message.picture = await getPictureUrl(message.picture);
      }
    })
  );

  if (companion?.profilePicture) {
    companion.profilePicture = await getPictureUrl(companion.profilePicture);
  }

  const nextCursor = messages.length ? messages[messages.length - 1]._id : null;
  const hasMore = messages.length === limit;

  return { nextCursor, messages, hasMore };
};

const getChatCompanion = async (chatId, userId) => {
  const chat = await chatRepository.findByIdAndMember(chatId, userId);
  if (!chat) throw new AppError(403, "Not your chat");

  const companionId = chat.membershipIds.find((id) => !idsEqual(id, userId));
  const companion = await userRepository.findById(companionId);

  if (companion?.profilePicture) {
    companion.profilePicture = await getPictureUrl(companion.profilePicture);
  }
  return companion;
};

module.exports = { createDirectChat, getChatMessages, getChatCompanion };
