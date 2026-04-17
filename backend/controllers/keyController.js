const { asyncHandler } = require("../middleware/error");
const keyService = require("../services/keyService");

const updatePublicKey = asyncHandler(async (req, res) => {
  const userId = req.userPayload?.sub;
  const { publicKey } = req.body;
  const result = await keyService.updatePublicKey(userId, publicKey);
  res.status(200).json(result);
});

const getPeerPublicKey = asyncHandler(async (req, res) => {
  const userId = req.userPayload.sub;
  const chatId = req.method === "GET" ? req.query.chatId : req.body.chatId;
  const result = await keyService.getPeerPublicKey(chatId, userId);
  res.status(200).json(result);
});

module.exports = { updatePublicKey, getPeerPublicKey };
