const { asyncHandler } = require("../middleware/error");
const callService = require("../services/callService");

const createCall = asyncHandler(async (req, res) => {
  const userId = req.userPayload.sub;
  const { companionId } = req.body;
  const result = await callService.createCall(userId, companionId);
  res.status(200).json(result);
});

const verifyCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const userId = req.userPayload.sub;
  await callService.verifyMembership(callId, userId);
  res.status(200).json("Ok");
});

const disconnectCall = asyncHandler(async (req, res) => {
  const { callId } = req.params;
  const userId = req.userPayload.sub;
  await callService.disconnectCall(callId, userId);
  res.status(200).json("Disconnected");
});

module.exports = { createCall, verifyCall, disconnectCall };
