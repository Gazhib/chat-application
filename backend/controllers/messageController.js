const { asyncHandler } = require("../middleware/error");
const messageService = require("../services/messageService");

const createMessage = asyncHandler(async (req, res) => {
  const senderId = req.userPayload.sub;
  const result = await messageService.createMessage({
    senderId,
    body: req.body,
    file: req.file,
  });
  res.status(200).json(result);
});

const markMessageRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userPayload.sub;
  const updated = await messageService.markMessageRead(messageId, userId);
  res.status(200).json(updated);
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.userPayload.sub;
  await messageService.deleteMessage(messageId, userId);
  res.status(200).json("Successfully deleted message");
});

module.exports = { createMessage, markMessageRead, deleteMessage };
