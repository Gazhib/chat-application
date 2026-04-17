const { AppError } = require("../middleware/error");
const {
  userRepository,
  chatRepository,
  messageRepository,
} = require("../repositories");
const { idsEqual } = require("../utils/ids");
const { getPictureUrl, uploadPicture } = require("./storageService");

const listCompanions = async (userId) => {
  const chats = await chatRepository.findAllByMember(userId);

  const chatIds = chats.map((c) => c._id);
  const chatIdByCompanion = new Map();
  const companionIds = [];

  for (const chat of chats) {
    const companionId = chat.membershipIds.find((id) => !idsEqual(id, userId));
    if (companionId) {
      chatIdByCompanion.set(companionId.toString(), chat._id.toString());
      companionIds.push(companionId);
    }
  }

  const [lastMessages, users] = await Promise.all([
    messageRepository.findLastPerChat(chatIds),
    userRepository.findManyByIds(companionIds),
  ]);

  const lastMessageByChat = new Map(
    lastMessages.map((m) => [m.chatId.toString(), m])
  );

  await Promise.all(
    users.map(async (user) => {
      const chatId = chatIdByCompanion.get(user._id.toString());
      user.chatId = chatId;

      const lastMessage = chatId
        ? lastMessageByChat.get(chatId.toString())
        : undefined;
      user.lastMessage = lastMessage;

      if (lastMessage) {
        lastMessage.encVersion = lastMessage.encVersion ?? 1;
        if (
          lastMessage.messageType !== "txt" &&
          lastMessage.messageType !== "call" &&
          lastMessage.picture
        ) {
          lastMessage.picture = await getPictureUrl(lastMessage.picture);
        }
      }

      if (user.profilePicture) {
        user.profilePicture = await getPictureUrl(user.profilePicture);
      }
    })
  );

  users.sort((a, b) => {
    const dateA = a.lastMessage
      ? new Date(a.lastMessage.createdAt)
      : new Date(0);
    const dateB = b.lastMessage
      ? new Date(b.lastMessage.createdAt)
      : new Date(0);
    return dateB - dateA;
  });

  return users;
};

const searchUsers = async (pattern) => {
  const users = await userRepository.searchByLogin(pattern);
  await Promise.all(
    users.map(async (user) => {
      if (user.profilePicture) {
        user.profilePicture = await getPictureUrl(user.profilePicture);
      }
    })
  );
  return users;
};

const updateDescription = async (userId, description) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError(400, "Could not find user");
  await userRepository.updateById(userId, { description });
};

const updateProfilePicture = async (userId, file) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError(400, "Something went wrong");

  const imageName = await uploadPicture(file);
  await userRepository.updateById(userId, { profilePicture: imageName });
  return getPictureUrl(imageName);
};

const getCurrentUser = async (payload) => {
  const { login, role, email, sub } = payload || {};
  if (!login || !role) {
    throw new AppError(401, { error: "Unauthorized" });
  }

  const user = await userRepository.findById(sub);
  const profilePicture = user?.profilePicture
    ? await getPictureUrl(user.profilePicture)
    : null;

  return {
    _id: sub,
    login,
    role,
    email,
    isVerified: user?.isVerified,
    description: user?.description,
    profilePicture,
  };
};

module.exports = {
  listCompanions,
  searchUsers,
  updateDescription,
  updateProfilePicture,
  getCurrentUser,
};
