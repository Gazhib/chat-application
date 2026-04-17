const { asyncHandler, AppError } = require("../middleware/error");
const chatService = require("../services/chatService");

const createChat = asyncHandler(async (req, res) => {
  const userId = req.userPayload.sub;
  const { companionId } = req.body;
  const chat = await chatService.createDirectChat(userId, companionId);
  res.status(200).json(chat);
});

const getMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userPayload.sub;
  const result = await chatService.getChatMessages({
    chatId,
    userId,
    beforeId: req.query.beforeId,
    limitRaw: req.query.limit,
  });
  res.status(200).json(result);
});

// Preserves the original /chats/:chatId/companion behavior:
// intended auth failures return 403, unexpected errors return 400.
const getCompanion = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.userPayload.sub;
  try {
    const companion = await chatService.getChatCompanion(chatId, userId);
    return res.status(200).json({ companion });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json(error.body);
    }
    return res.status(400).json(error?.message || "Something went wrong...");
  }
};

module.exports = { createChat, getMessages, getCompanion };
