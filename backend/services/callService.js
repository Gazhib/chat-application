const crypto = require("crypto");
const { AppError } = require("../middleware/error");
const { callRoomRepository, messageRepository } = require("../repositories");

const createCall = async (userId, companionId) => {
  if (await callRoomRepository.memberIsInCall(userId)) {
    throw new AppError(403, "You are already in call");
  }
  if (await callRoomRepository.memberIsInCall(companionId)) {
    throw new AppError(403, "User is already in call");
  }

  let roomId = crypto.randomUUID();
  while (await callRoomRepository.roomIdExists(roomId)) {
    roomId = crypto.randomUUID();
  }

  await callRoomRepository.create({
    membershipIds: [userId, companionId],
    creatorId: userId,
    roomId,
  });

  return { roomId };
};

const verifyMembership = async (callId, userId) => {
  const call = await callRoomRepository.findByRoomIdAndMember(callId, userId);
  if (!call) {
    throw new AppError(
      403,
      "Call does not exist, or you are not a member of the call"
    );
  }
};

const disconnectCall = async (roomId, userId) => {
  const call = await callRoomRepository.findByRoomIdAndMember(roomId, userId);
  await messageRepository.markFinished(roomId);
  if (call) await callRoomRepository.deleteById(call._id);
};

module.exports = { createCall, verifyMembership, disconnectCall };
